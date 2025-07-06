import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../lib/api'

const CaseDetail = () => {
  const { id } = useParams()

  const { data: caseItem, isLoading } = useQuery(
    ['case', id],
    async () => {
      const response = await api.get(`/cases/${id}`)
      return response.data
    }
  )

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
        <h3 className="text-lg font-medium text-gray-900">Case not found</h3>
        <p className="text-gray-500">The case you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{caseItem.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            caseItem.status === 'Published for Voting' 
              ? 'bg-success-100 text-success-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {caseItem.status}
          </span>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-4">{caseItem.description}</p>
        </div>

        <div className="border-t pt-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Created by:</span>
              <p className="text-gray-600">{caseItem.createdBy?.username}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Created:</span>
              <p className="text-gray-600">
                {new Date(caseItem.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Total votes:</span>
              <p className="text-gray-600">{caseItem.totalVotes || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Section */}
      {caseItem.status === 'Published for Voting' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vote on this case</h2>
          <div className="flex space-x-4">
            <button className="bg-success-600 text-white px-6 py-2 rounded-md hover:bg-success-700">
              Vote Yes
            </button>
            <button className="bg-danger-600 text-white px-6 py-2 rounded-md hover:bg-danger-700">
              Vote No
            </button>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
        {caseItem.comments?.length > 0 ? (
          <div className="space-y-4">
            {caseItem.comments.map((comment, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {comment.commentedBy?.username || 'Anonymous'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600">{comment.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}
      </div>
    </div>
  )
}

export default CaseDetail 