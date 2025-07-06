import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useEffect } from 'react'

const Layout = () => {
  const { isAuthenticated } = useAuth()

  // Initialize theme from localStorage
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light'
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-300 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 ${isAuthenticated ? 'ml-64' : ''}`}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Layout 