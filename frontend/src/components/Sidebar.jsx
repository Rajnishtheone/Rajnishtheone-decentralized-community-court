import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Home,
  FileText,
  Plus,
  BarChart3,
  User,
  Settings,
  Users,
  Gavel
} from 'lucide-react'

const Sidebar = () => {
  const { user } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Cases', href: '/cases', icon: FileText },
    { name: 'Create Case', href: '/create-case', icon: Plus },
    ...(user?.role === 'admin' || user?.role === 'judge' ? [
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Users', href: '/users', icon: Users },
    ] : []),
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white dark:bg-zinc-800 shadow-lg border-r border-border dark:border-zinc-700 transition-colors duration-300">
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        
        {/* User Info */}
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-zinc-700 p-4 transition-colors duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 