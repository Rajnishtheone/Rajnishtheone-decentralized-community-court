import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { FileText, Clock, Users, Eye } from 'lucide-react'

const Cases = () => {
  const { data: cases, isLoading } = useQuery(
    'cases',
    async () => {
      const response = await api.get('/cases')
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center" aria-label="Cases header">
        <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
        <Link
          to="/create-case"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Create Case
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Cases list">
        {cases?.cases?.map((caseItem) => (
          <div key={caseItem._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{caseItem.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                caseItem.status === 'Published for Voting' 
                  ? 'bg-success-100 text-success-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {caseItem.status}
              </span>
            </div>
            {/* Fallback for line-clamp if plugin is not available */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {caseItem.description}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {caseItem.totalVotes || 0} votes
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(caseItem.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <Link
                to={`/cases/${caseItem._id}`}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>
            </div>
          </div>
        ))}
      </div>

      {(!cases?.cases || cases.cases.length === 0) && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No cases found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new case.
          </p>
          <div className="mt-6">
            <Link
              to="/create-case"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Create Case
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cases 