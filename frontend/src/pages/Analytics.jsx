import { useQuery } from 'react-query'
import api from '../lib/api'
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react'

const Analytics = () => {
  const { data: stats, isLoading } = useQuery(
    'analytics',
    async () => {
      const response = await api.get('/analytics/community-stats')
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
      <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Users
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats?.community?.totalUsers || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Cases
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats?.community?.totalCases || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Votes
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats?.voting?.totalVotes || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Approved Cases
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats?.community?.approvedCases || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Voting Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Yes Votes</h3>
            <div className="bg-success-100 rounded-full h-4">
              <div 
                className="bg-success-600 h-4 rounded-full"
                style={{ 
                  width: `${stats?.voting?.totalVotes > 0 ? (stats.voting.yesVotes / stats.voting.totalVotes) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {stats?.voting?.yesVotes || 0} votes ({stats?.voting?.totalVotes > 0 ? Math.round((stats.voting.yesVotes / stats.voting.totalVotes) * 100) : 0}%)
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">No Votes</h3>
            <div className="bg-danger-100 rounded-full h-4">
              <div 
                className="bg-danger-600 h-4 rounded-full"
                style={{ 
                  width: `${stats?.voting?.totalVotes > 0 ? (stats.voting.noVotes / stats.voting.totalVotes) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {stats?.voting?.noVotes || 0} votes ({stats?.voting?.totalVotes > 0 ? Math.round((stats.voting.noVotes / stats.voting.totalVotes) * 100) : 0}%)
            </p>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      {stats?.categories && stats.categories.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Categories</h2>
          <div className="space-y-3">
            {stats.categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {category._id || 'Other'}
                </span>
                <span className="text-sm text-gray-600">
                  {category.count} cases
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder for charts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Trends</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>Charts and detailed analytics coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics 