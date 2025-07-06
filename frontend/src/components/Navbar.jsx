import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Scale, Menu, X, User, LogOut, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

const Navbar = () => {
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
    <nav className="bg-white dark:bg-zinc-900 shadow-sm border-b border-border dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
              <span className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">DCC</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="relative w-10 h-10 flex items-center justify-center rounded-full border border-border dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle theme"
            >
              <span className="absolute inset-0 flex items-center justify-center transition-transform duration-500" style={{ transform: theme === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <Sun className={`h-6 w-6 text-yellow-400 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
                <Moon className={`h-6 w-6 text-blue-400 absolute transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
              </span>
            </button>
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{user?.username}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 dark:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 dark:hover:bg-primary-800"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-zinc-900 border-t border-border dark:border-zinc-800 transition-colors duration-300">
            <button
              onClick={toggleTheme}
              className="relative w-10 h-10 flex items-center justify-center rounded-full border border-border dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
              aria-label="Toggle theme"
            >
              <span className="absolute inset-0 flex items-center justify-center transition-transform duration-500" style={{ transform: theme === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <Sun className={`h-6 w-6 text-yellow-400 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
                <Moon className={`h-6 w-6 text-blue-400 absolute transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
              </span>
            </button>
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                  Welcome, {user?.username}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-left text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar 