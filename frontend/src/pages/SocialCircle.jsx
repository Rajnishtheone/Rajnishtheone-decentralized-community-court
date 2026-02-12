import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import api from '../lib/api'
import { socket } from '../lib/socket'
import { useAuth } from '../context/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { getMediaUrl, getProfilePicUrl } from '../utils/media'
import toast from 'react-hot-toast'

const SocialCircle = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('feed')
  const [postCaption, setPostCaption] = useState('')
  const [postVisibility, setPostVisibility] = useState('friends')
  const [postMedia, setPostMedia] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeConversation, setActiveConversation] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [typingState, setTypingState] = useState({})

  const { data: feedData, isLoading: feedLoading } = useQuery('social-feed', async () => {
    const response = await api.get('/social/posts/feed')
    return response.data
  })

  const { data: friendsData } = useQuery('social-friends', async () => {
    const response = await api.get('/social/friends')
    return response.data
  })

  const { data: requestsIn } = useQuery('social-requests-in', async () => {
    const response = await api.get('/social/friends/requests?type=received')
    return response.data
  })

  const { data: requestsOut } = useQuery('social-requests-out', async () => {
    const response = await api.get('/social/friends/requests?type=sent')
    return response.data
  })

  const { data: blockedData } = useQuery('social-blocked', async () => {
    const response = await api.get('/social/friends/blocked')
    return response.data
  })

  const { data: conversationsData } = useQuery('social-conversations', async () => {
    const response = await api.get('/social/conversations')
    return response.data
  })

  const { data: messagesData } = useQuery(
    ['social-messages', activeConversation?._id],
    async () => {
      const response = await api.get(`/social/conversations/${activeConversation._id}/messages`)
      return response.data
    },
    { enabled: !!activeConversation?._id }
  )

  const { data: searchData } = useQuery(
    ['social-search', searchQuery],
    async () => {
      const response = await api.get(`/social/friends/search?q=${encodeURIComponent(searchQuery)}`)
      return response.data
    },
    { enabled: searchQuery.trim().length > 1 }
  )

  const createPostMutation = useMutation(
    async () => {
      const formData = new FormData()
      formData.append('caption', postCaption)
      formData.append('visibility', postVisibility)
      if (postMedia) {
        formData.append('media', postMedia)
      }
      const response = await api.post('/social/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Post created')
        setPostCaption('')
        setPostMedia(null)
        queryClient.invalidateQueries('social-feed')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create post')
      }
    }
  )

  const likeMutation = useMutation(
    async (postId) => {
      const response = await api.post(`/social/posts/${postId}/like`)
      return response.data
    },
    {
      onSuccess: () => queryClient.invalidateQueries('social-feed')
    }
  )

  const dislikeMutation = useMutation(
    async (postId) => {
      const response = await api.post(`/social/posts/${postId}/dislike`)
      return response.data
    },
    {
      onSuccess: () => queryClient.invalidateQueries('social-feed')
    }
  )

  const commentMutation = useMutation(
    async ({ postId, text }) => {
      const response = await api.post(`/social/posts/${postId}/comment`, { text })
      return response.data
    },
    {
      onSuccess: () => queryClient.invalidateQueries('social-feed')
    }
  )

  const friendRequestMutation = useMutation(
    async (userId) => {
      const response = await api.post(`/social/friends/request/${userId}`)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Friend request sent')
        queryClient.invalidateQueries('social-requests-out')
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Failed to send request')
    }
  )

  const acceptRequestMutation = useMutation(
    async (requestId) => api.post(`/social/friends/accept/${requestId}`),
    {
      onSuccess: () => {
        toast.success('Friend request accepted')
        queryClient.invalidateQueries('social-friends')
        queryClient.invalidateQueries('social-requests-in')
      }
    }
  )

  const rejectRequestMutation = useMutation(
    async (requestId) => api.post(`/social/friends/reject/${requestId}`),
    {
      onSuccess: () => {
        toast.success('Friend request rejected')
        queryClient.invalidateQueries('social-requests-in')
      }
    }
  )

  const cancelRequestMutation = useMutation(
    async (requestId) => api.post(`/social/friends/cancel/${requestId}`),
    {
      onSuccess: () => {
        toast.success('Request cancelled')
        queryClient.invalidateQueries('social-requests-out')
      }
    }
  )

  const removeFriendMutation = useMutation(
    async (userId) => api.delete(`/social/friends/remove/${userId}`),
    {
      onSuccess: () => {
        toast.success('Friend removed')
        queryClient.invalidateQueries('social-friends')
      }
    }
  )

  const blockMutation = useMutation(
    async (userId) => api.post(`/social/friends/block/${userId}`),
    {
      onSuccess: () => {
        toast.success('User blocked')
        queryClient.invalidateQueries('social-friends')
        queryClient.invalidateQueries('social-blocked')
      }
    }
  )

  const unblockMutation = useMutation(
    async (userId) => api.post(`/social/friends/unblock/${userId}`),
    {
      onSuccess: () => {
        toast.success('User unblocked')
        queryClient.invalidateQueries('social-blocked')
      }
    }
  )

  const startConversationMutation = useMutation(
    async (userId) => {
      const response = await api.post(`/social/conversations/${userId}`)
      return response.data
    },
    {
      onSuccess: async (data) => {
        setActiveTab('messages')
        await queryClient.invalidateQueries('social-conversations')
        const refreshed = await queryClient.fetchQuery('social-conversations')
        const match = refreshed?.conversations?.find((c) => c._id === data.conversation._id)
        setActiveConversation(match || data.conversation)
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Failed to start conversation')
    }
  )

  const sendMessageMutation = useMutation(
    async () => {
      const response = await api.post(`/social/conversations/${activeConversation._id}/messages`, {
        text: messageText
      })
      return response.data
    },
    {
      onSuccess: () => {
        setMessageText('')
        queryClient.invalidateQueries(['social-messages', activeConversation?._id])
        queryClient.invalidateQueries('social-conversations')
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Failed to send message')
    }
  )

  const conversations = conversationsData?.conversations || []
  const messages = messagesData?.messages || []

  useEffect(() => {
    const handleChatMessage = (payload) => {
      if (payload.conversationId === activeConversation?._id) {
        queryClient.invalidateQueries(['social-messages', activeConversation?._id])
      }
      queryClient.invalidateQueries('social-conversations')
    }

    const handleTyping = (payload) => {
      setTypingState((prev) => ({
        ...prev,
        [payload.conversationId]: payload.fromUserId
      }))
    }

    const handleStopTyping = (payload) => {
      setTypingState((prev) => {
        const next = { ...prev }
        delete next[payload.conversationId]
        return next
      })
    }

    socket.on('chat_message', handleChatMessage)
    socket.on('typing', handleTyping)
    socket.on('stop_typing', handleStopTyping)
    socket.on('social_post_update', () => {
      queryClient.invalidateQueries('social-feed')
    })
    socket.on('friend_request', () => {
      queryClient.invalidateQueries('social-requests-in')
    })
    socket.on('friend_update', () => {
      queryClient.invalidateQueries('social-friends')
    })

    return () => {
      socket.off('chat_message', handleChatMessage)
      socket.off('typing', handleTyping)
      socket.off('stop_typing', handleStopTyping)
      socket.off('social_post_update')
      socket.off('friend_request')
      socket.off('friend_update')
    }
  }, [activeConversation, queryClient])

  useEffect(() => {
    if (activeConversation?._id) {
      api.post(`/social/conversations/${activeConversation._id}/seen`).catch(() => {})
    }
  }, [activeConversation])

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConversation) return
    sendMessageMutation.mutate()
    handleStopTyping()
  }

  const handleTyping = () => {
    if (!activeConversation) return
    const other = activeConversation.participants?.find((p) => p._id !== user?.id)
    if (other?._id) {
      socket.emit('typing', { toUserId: other._id, conversationId: activeConversation._id })
    }
  }

  const handleStopTyping = () => {
    if (!activeConversation) return
    const other = activeConversation.participants?.find((p) => p._id !== user?.id)
    if (other?._id) {
      socket.emit('stop_typing', { toUserId: other._id, conversationId: activeConversation._id })
    }
  }

  const feedPosts = feedData?.posts || []
  const friends = friendsData?.friends || []
  const incomingRequests = requestsIn?.requests || []
  const outgoingRequests = requestsOut?.requests || []
  const blockedUsers = blockedData?.blockedUsers || []
  const searchResults = searchData?.users || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Social Circle</h1>
            <p className="text-muted-foreground">Connect, chat, and share with your community.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="requests">Friend Requests</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="blocked">Blocked Users</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create a post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="form-textarea w-full"
                  placeholder="Share an update with your friends..."
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                />
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setPostMedia(e.target.files?.[0] || null)}
                  />
                  <select
                    className="form-input md:w-48"
                    value={postVisibility}
                    onChange={(e) => setPostVisibility(e.target.value)}
                  >
                    <option value="friends">Friends only</option>
                    <option value="public">Public</option>
                  </select>
                  <Button
                    onClick={() => createPostMutation.mutate()}
                    disabled={createPostMutation.isLoading}
                  >
                    {createPostMutation.isLoading ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {feedLoading && <div className="text-muted-foreground">Loading feed...</div>}
            {!feedLoading && feedPosts.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No posts yet. Be the first to share.
                </CardContent>
              </Card>
            )}

            {feedPosts.map((post) => (
              <Card key={post._id} className="hover-lift">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={getProfilePicUrl(post.user?.profilePic)} />
                      <AvatarFallback>{post.user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{post.user?.name || post.user?.username}</div>
                      <div className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{post.visibility}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {post.caption && <p className="text-muted-foreground">{post.caption}</p>}
                  {post.mediaUrl && post.mediaType === 'image' && (
                    <img src={getMediaUrl(post.mediaUrl)} alt="Post" className="rounded-lg w-full max-h-96 object-cover" />
                  )}
                  {post.mediaUrl && post.mediaType === 'video' && (
                    <video controls className="rounded-lg w-full max-h-96">
                      <source src={getMediaUrl(post.mediaUrl)} />
                    </video>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" variant="outline" onClick={() => likeMutation.mutate(post._id)}>
                      Like ({post.likes?.length || 0})
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => dislikeMutation.mutate(post._id)}>
                      Dislike ({post.dislikes?.length || 0})
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {post.comments?.slice(0, 3).map((comment) => (
                      <div key={comment._id} className="text-sm text-muted-foreground">
                        <strong className="text-foreground">{comment.user?.name || comment.user?.username}:</strong> {comment.text}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      type="text"
                      className="form-input flex-1"
                      placeholder="Add a comment..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = e.currentTarget.value.trim()
                          if (value) {
                            commentMutation.mutate({ postId: post._id, text: value })
                          }
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="friends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Find friends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by name, username, or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={getProfilePicUrl(user.profilePic)} />
                            <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">{user.name || user.username}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => friendRequestMutation.mutate(user._id)}>
                          Add Friend
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your friends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {friends.length === 0 && <div className="text-muted-foreground">No friends yet.</div>}
                {friends.map((friend) => (
                  <div key={friend._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={getProfilePicUrl(friend.profilePic)} />
                        <AvatarFallback>{friend.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{friend.name || friend.username}</div>
                        <div className="text-xs text-muted-foreground">{friend.email}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startConversationMutation.mutate(friend._id)}>
                        Message
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeFriendMutation.mutate(friend._id)}>
                        Remove
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => blockMutation.mutate(friend._id)}>
                        Block
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Incoming requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {incomingRequests.length === 0 && <div className="text-muted-foreground">No incoming requests.</div>}
                {incomingRequests.map((req) => (
                  <div key={req._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={getProfilePicUrl(req.sender?.profilePic)} />
                        <AvatarFallback>{req.sender?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{req.sender?.name || req.sender?.username}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptRequestMutation.mutate(req._id)}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => rejectRequestMutation.mutate(req._id)}>Reject</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outgoing requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {outgoingRequests.length === 0 && <div className="text-muted-foreground">No outgoing requests.</div>}
                {outgoingRequests.map((req) => (
                  <div key={req._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={getProfilePicUrl(req.receiver?.profilePic)} />
                        <AvatarFallback>{req.receiver?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{req.receiver?.name || req.receiver?.username}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => cancelRequestMutation.mutate(req._id)}>
                      Cancel
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {conversations.length === 0 && <div className="text-muted-foreground">No conversations yet.</div>}
                  {conversations.map((conv) => {
                    const other = conv.participants?.find((p) => p._id !== user?.id)
                    return (
                      <button
                        key={conv._id}
                        onClick={() => setActiveConversation(conv)}
                        className={`w-full text-left p-3 rounded-lg border ${activeConversation?._id === conv._id ? 'border-primary' : 'border-border'} hover:bg-accent`}
                      >
                        <div className="font-medium text-foreground">{other?.name || other?.username || 'Friend'}</div>
                        <div className="text-xs text-muted-foreground">{conv.lastMessage || 'No messages yet'}</div>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!activeConversation && <div className="text-muted-foreground">Select a conversation to start chatting.</div>}
                  {activeConversation && (
                    <>
                      <div className="h-64 overflow-y-auto border rounded-lg p-3 space-y-3">
                        {messages.map((msg) => (
                          <div key={msg._id} className="text-sm">
                            <strong className="text-foreground">{msg.sender?.name || msg.sender?.username}:</strong>{' '}
                            <span className="text-muted-foreground">{msg.text}</span>
                          </div>
                        ))}
                        {typingState[activeConversation._id] && (
                          <div className="text-xs text-muted-foreground">Typing...</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="form-input flex-1"
                          value={messageText}
                          placeholder="Type a message"
                          onChange={(e) => {
                            setMessageText(e.target.value)
                            handleTyping()
                          }}
                          onBlur={handleStopTyping}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSendMessage()
                              handleStopTyping()
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage}>Send</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="blocked" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Blocked Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {blockedUsers.length === 0 && <div className="text-muted-foreground">No blocked users.</div>}
                {blockedUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={getProfilePicUrl(user.profilePic)} />
                        <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{user.name || user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => unblockMutation.mutate(user._id)}>
                      Unblock
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default SocialCircle
