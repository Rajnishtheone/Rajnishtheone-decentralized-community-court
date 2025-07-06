import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { User, Mail, Phone, MapPin, Clock, AlertTriangle, CheckCircle, MessageSquare, Send } from 'lucide-react'

const CaseDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [responseText, setResponseText] = useState('')
  const [showResponseForm, setShowResponseForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: caseItem, isLoading } = useQuery(
    ['case', id],
    async () => {
      const response = await api.get(`/cases/${id}`)
      return response.data
    }
  )

  // Submit target response mutation
  const submitResponseMutation = useMutation(
    async (response) => {
      const apiResponse = await api.post(`/cases/${id}/respond`, { response })
      return apiResponse.data
    },
    {
      onSuccess: () => {
        toast.success('Response submitted successfully')
        queryClient.invalidateQueries(['case', id])
        setResponseText('')
        setShowResponseForm(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to submit response')
      }
    }
  )

  const handleSubmitResponse = () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response')
      return
    }
    submitResponseMutation.mutate(responseText)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Verification': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Verification Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Target Notified': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Awaiting Response': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'Response Received': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Under Review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Published for Voting': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'Verdict Reached': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'Closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const isTarget = caseItem?.verifiedTarget?._id === user?.id
  const canRespond = isTarget && caseItem?.status === 'Target Notified' && !caseItem?.targetResponse?.received

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!caseItem) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Case not found</h3>
        <p className="text-gray-500 dark:text-gray-400">The case you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Case Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{caseItem.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseItem.status)}`}>
            {caseItem.status}
          </span>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-4">{caseItem.description}</p>
        </div>

        {/* Case Metadata */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Filed by:</span>
              <p className="text-gray-600 dark:text-gray-300">{caseItem.filedBy?.username}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Filed on:</span>
              <p className="text-gray-600 dark:text-gray-300">
                {new Date(caseItem.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Category:</span>
              <p className="text-gray-600 dark:text-gray-300">{caseItem.category}</p>
            </div>
          </div>
        </div>

        {/* Evidence */}
        {caseItem.evidence && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Evidence</h3>
            <a 
              href={caseItem.evidence} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Evidence
            </a>
          </div>
        )}
      </div>

      {/* Target Information */}
      {caseItem.targetInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Target Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseItem.targetInfo.name && (
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">{caseItem.targetInfo.name}</span>
              </div>
            )}
            {caseItem.targetInfo.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">{caseItem.targetInfo.email}</span>
              </div>
            )}
            {caseItem.targetInfo.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">{caseItem.targetInfo.phone}</span>
              </div>
            )}
            {caseItem.targetInfo.building && caseItem.targetInfo.flat && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">
                  {caseItem.targetInfo.building} - {caseItem.targetInfo.flat}
                </span>
              </div>
            )}
            {caseItem.targetInfo.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">{caseItem.targetInfo.location}</span>
              </div>
            )}
            {caseItem.targetInfo.timeOfIncident && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">{caseItem.targetInfo.timeOfIncident}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verification Status */}
      {caseItem.verificationStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verification Status</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Status:</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                caseItem.verificationStatus === 'completed' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : caseItem.verificationStatus === 'failed'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {caseItem.verificationStatus}
              </span>
            </div>
            {caseItem.verifiedTarget && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Verified Target:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {caseItem.verifiedTarget.username}
                </span>
              </div>
            )}
            {caseItem.verificationNotes && (
              <div>
                <span className="text-gray-700 dark:text-gray-300">Notes:</span>
                <p className="text-gray-900 dark:text-white mt-1">{caseItem.verificationNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Target Response */}
      {caseItem.targetResponse?.received && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
            Target Response
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-gray-900 dark:text-white mb-2">{caseItem.targetResponse.response}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Responded on: {new Date(caseItem.targetResponse.respondedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Target Response Form */}
      {canRespond && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Respond to Case
            </h2>
            <button
              onClick={() => setShowResponseForm(!showResponseForm)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {showResponseForm ? 'Cancel' : 'Respond'}
            </button>
          </div>
          
          {showResponseForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Response *
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  className="input w-full"
                  placeholder="Provide your response to this case. Include any relevant information, evidence, or clarifications..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowResponseForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  disabled={submitResponseMutation.isLoading || !responseText.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {submitResponseMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Response
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voting Section */}
      {caseItem.status === 'Published for Voting' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vote on this case</h2>
          <div className="flex space-x-4">
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Vote Yes
            </button>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Vote No
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Total votes: {caseItem.totalVotes || 0}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comments</h2>
        {caseItem.comments?.length > 0 ? (
          <div className="space-y-4">
            {caseItem.comments.map((comment, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.commentedBy?.username || 'Anonymous'}
                    </span>
                    {comment.isJudgeComment && (
                      <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs rounded-full">
                        Judge
                      </span>
                    )}
                    {comment.isAdminComment && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
        )}
      </div>
    </div>
  )
}

export default CaseDetail 