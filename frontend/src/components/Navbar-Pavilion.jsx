import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Scale, Menu, X, User, LogOut, Sun, Moon, Home } from 'lucide-react'
import { useState, useEffect } from 'react'

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-all duration-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Home */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg group-hover:bg-blue-700 dark:group-hover:bg-blue-600 transition-colors duration-200">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                DCC Court
              </span>
            </Link>
            
            {/* Home Button */}
            <Link
              to="/"
              className="hidden md:flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Toggle theme"
            >
              <Sun className={`h-5 w-5 text-yellow-500 transition-all duration-300 ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
              <Moon className={`h-5 w-5 text-blue-500 absolute transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
            </button>

            {isAuthenticated ? (
              <>
                {/* Menu Button for Desktop */}
                <button
                  onClick={onMenuClick}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 text-blue-600 dark:text-blue-400"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>

                {/* User Info */}
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.username}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Login
                </Link>

                {/* Register Button */}
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle for Mobile */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              aria-label="Toggle theme"
            >
              <Sun className={`h-5 w-5 text-yellow-500 transition-all duration-300 ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
              <Moon className={`h-5 w-5 text-blue-500 absolute transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
            </button>

            {/* Menu Button for Mobile */}
            {isAuthenticated ? (
              <button
                onClick={onMenuClick}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 text-blue-600 dark:text-blue-400"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation - only show for non-authenticated users */}
      {!isAuthenticated && isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {/* Home Link for Mobile */}
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>

            {/* Login for Mobile */}
            <Link
              to="/login"
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>

            {/* Register for Mobile */}
            <Link
              to="/register"
              className="block px-3 py-2 text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar 