import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useEffect, useState } from 'react'

const Layout = () => {
  const { isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Initialize theme from localStorage
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light'
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300 flex flex-col">
      <Navbar onMenuClick={handleSidebarToggle} />
      
      <div className="flex flex-1 relative">
        {/* Sidebar - only show when authenticated */}
        {isAuthenticated && (
          <Sidebar 
            open={sidebarOpen} 
            onClose={handleSidebarClose}
          />
        )}
        
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isAuthenticated ? 'ml-0' : ''}`}>
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  )
}

export default Layout 