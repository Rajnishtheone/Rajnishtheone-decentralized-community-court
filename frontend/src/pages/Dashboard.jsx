import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useQuery } from 'react-query'
import api from '../lib/api'
import {
  FileText,
  Users,
  TrendingUp,
  Clock,
  Plus,
  Eye,
  MessageSquare,
  Award
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    totalVotes: 0,
    totalComments: 0
  })

  // Fetch user dashboard data
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    async () => {
      const response = await api.get('/users/dashboard')
      return response.data
    },
    {
      onSuccess: (data) => {
        setStats({
          totalCases: data.filedCases?.length || 0,
          activeCases: data.filedCases?.filter(c => c.status === 'Published for Voting').length || 0,
          totalVotes: data.voteActivity?.length || 0,
          totalComments: data.commentActivity?.length || 0
        })
      }
    }
  )

  const quickActions = [
    {
      title: 'Create New Case',
      description: 'File a new case for community review',
      icon: Plus,
      href: '/create-case',
      color: 'bg-primary-500'
    },
    {
      title: 'View Cases',
      description: 'Browse all available cases',
      icon: Eye,
      href: '/cases',
      color: 'bg-success-500'
    },
    {
      title: 'My Activity',
      description: 'View your voting and commenting history',
      icon: MessageSquare,
      href: '/profile',
      color: 'bg-secondary-500'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening in your community court.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Cases
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalCases}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Cases
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.activeCases}
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
                  {stats.totalVotes}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Comments
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalComments}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="group relative bg-white p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${action.color} bg-opacity-10`}>
                    <action.icon className={`h-6 w-6 ${action.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {dashboardData && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            {dashboardData.voteActivity?.length > 0 || dashboardData.commentActivity?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.voteActivity?.slice(0, 3).map((vote, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-success-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        You voted <span className="font-medium">{vote.vote}</span> on case "{vote.title}"
                      </p>
                    </div>
                  </div>
                ))}
                {dashboardData.commentActivity?.slice(0, 3).map((comment, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-secondary-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        You commented on case "{comment.title}"
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {comment.comment.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent activity. Start by creating a case or voting on existing ones!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard 