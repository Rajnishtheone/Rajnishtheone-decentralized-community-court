import express from 'express'
import rateLimit from 'express-rate-limit'
import { protect } from '../middlewares/authMiddleware.js'
import { upload as socialUpload, handleUploadError } from '../middlewares/socialUpload.js'
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
  getFriends,
  getFriendRequests,
  getBlockedUsers,
  searchUsers
} from '../controllers/socialFriendController.js'
import {
  createPost,
  getFeed,
  getUserPosts,
  toggleLike,
  toggleDislike,
  addComment,
  deleteComment,
  deletePost
} from '../controllers/socialPostController.js'
import {
  getOrCreateConversation,
  listConversations,
  getMessages,
  sendMessage,
  markSeen
} from '../controllers/socialChatController.js'
import {
  getNotifications,
  markNotificationRead,
  markAllRead
} from '../controllers/notificationController.js'

const router = express.Router()

const postLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: 'Too many posts/comments. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
})

// Friend system
router.post('/friends/request/:userId', protect, sendFriendRequest)
router.post('/friends/accept/:requestId', protect, acceptFriendRequest)
router.post('/friends/reject/:requestId', protect, rejectFriendRequest)
router.post('/friends/cancel/:requestId', protect, cancelFriendRequest)
router.delete('/friends/remove/:userId', protect, removeFriend)
router.post('/friends/block/:userId', protect, blockUser)
router.post('/friends/unblock/:userId', protect, unblockUser)
router.get('/friends', protect, getFriends)
router.get('/friends/requests', protect, getFriendRequests)
router.get('/friends/blocked', protect, getBlockedUsers)
router.get('/friends/search', protect, searchUsers)

// Posts
router.post('/posts', protect, postLimiter, socialUpload.single('media'), handleUploadError, createPost)
router.get('/posts/feed', protect, getFeed)
router.get('/posts/user/:userId', protect, getUserPosts)
router.post('/posts/:postId/like', protect, toggleLike)
router.post('/posts/:postId/dislike', protect, toggleDislike)
router.post('/posts/:postId/comment', protect, postLimiter, addComment)
router.delete('/posts/:postId', protect, deletePost)
router.delete('/comments/:commentId', protect, deleteComment)

// Chat
router.post('/conversations/:userId', protect, getOrCreateConversation)
router.get('/conversations', protect, listConversations)
router.get('/conversations/:conversationId/messages', protect, getMessages)
router.post('/conversations/:conversationId/messages', protect, sendMessage)
router.post('/conversations/:conversationId/seen', protect, markSeen)

// Notifications
router.get('/notifications', protect, getNotifications)
router.post('/notifications/:notificationId/read', protect, markNotificationRead)
router.post('/notifications/read-all', protect, markAllRead)

export default router
