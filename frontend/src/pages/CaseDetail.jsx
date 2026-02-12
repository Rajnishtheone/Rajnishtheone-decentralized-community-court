import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { socket } from '../lib/socket'
import { useAuth } from '../context/AuthContext'

const CaseDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [isVoting, setIsVoting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)

  const { data: caseItem, isLoading, refetch } = useQuery(
    ['case', id],
    async () => {
      const response = await api.get(`/cases/${id}`)
      return response.data
    }
  )

  const handleVote = async (vote) => {
    try {
      setIsVoting(true)
      await api.post(`/cases/${id}/vote`, { vote })
      toast.success('Vote cast successfully')
      await refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cast vote')
    } finally {
      setIsVoting(false)
    }
  }

  const handleComment = async () => {
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty')
      return
    }
    try {
      setIsCommenting(true)
      await api.post(`/cases/${id}/comment`, { text: commentText.trim() })
      toast.success('Comment added successfully')
      setCommentText('')
      await refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    } finally {
      setIsCommenting(false)
    }
  }

  const handleAiVerdict = async () => {
    try {
      setAiLoading(true)
      const response = await api.get(`/cases/${id}/ai-verdict`)
      setAiResult(response.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get AI verdict')
    } finally {
      setAiLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/users/cases/${id}/pdf`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `case-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download PDF')
    }
  }

  useEffect(() => {
    const handleUpdate = (payload) => {
      if (!payload?.caseId || payload.caseId === id) {
        queryClient.invalidateQueries(['case', id])
      }
    }
    socket.on('case_updated', handleUpdate)
    return () => {
      socket.off('case_updated', handleUpdate)
    }
  }, [id, queryClient])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!caseItem) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground">Case not found</h3>
        <p className="text-muted-foreground">The case you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">{caseItem.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${caseItem.status === 'Published for Voting'
              ? 'bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-200'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}>
            {caseItem.status}
          </span>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-4">{caseItem.description}</p>
        </div>

        <div className="border-t border-border pt-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-foreground">Filed by:</span>
              <p className="text-muted-foreground">{caseItem.filedBy?.username}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Created:</span>
              <p className="text-muted-foreground">
                {new Date(caseItem.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-foreground">Total votes:</span>
              <p className="text-muted-foreground">{caseItem.totalVotes || 0}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 mt-6 flex flex-wrap gap-2">
          {user && (
            <button
              className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              onClick={handleDownloadPdf}
            >
              Download PDF
            </button>
          )}
          {(user?.role === 'admin' || user?.role === 'judge') && (
            <button
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-60"
              onClick={handleAiVerdict}
              disabled={aiLoading}
            >
              {aiLoading ? 'Analyzing...' : 'Get AI Verdict'}
            </button>
          )}
        </div>
      </div>

      {(user?.role === 'admin' || user?.role === 'judge') && aiResult && (
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">AI Verdict Suggestion</h2>
          <p className="text-muted-foreground whitespace-pre-line">{aiResult.suggestion}</p>
          {aiResult.summary && (
            <>
              <h3 className="text-md font-semibold text-foreground mt-4">Summary</h3>
              <p className="text-muted-foreground whitespace-pre-line">{aiResult.summary}</p>
            </>
          )}
        </div>
      )}

      {/* Voting Section */}
      {caseItem.status === 'Published for Voting' && (
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Vote on this case</h2>
          <div className="flex space-x-4">
            <button
              className="bg-success-600 text-white px-6 py-2 rounded-md hover:bg-success-700 disabled:opacity-60"
              onClick={() => handleVote('yes')}
              disabled={isVoting}
            >
              Vote Yes
            </button>
            <button
              className="bg-danger-600 text-white px-6 py-2 rounded-md hover:bg-danger-700 disabled:opacity-60"
              onClick={() => handleVote('no')}
              disabled={isVoting}
            >
              Vote No
            </button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Comments</h2>
        {user ? (
          <div className="mb-6">
            <textarea
              rows={3}
              className="form-textarea w-full p-3 text-sm"
              placeholder="Share your thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <button
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-60"
                onClick={handleComment}
                disabled={isCommenting}
              >
                {isCommenting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">Log in to add a comment.</p>
        )}
        {caseItem.comments?.length > 0 ? (
          <div className="space-y-4">
            {caseItem.comments.map((comment, index) => (
              <div key={index} className="border-b border-border pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">
                    {comment.commentedBy?.username || 'Anonymous'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground">{comment.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No comments yet.</p>
        )}
      </div>
    </div>
  )
}

export default CaseDetail 
