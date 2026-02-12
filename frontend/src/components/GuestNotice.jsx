import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const STORAGE_KEY = 'dcc_guest_notice_dismissed'

const GuestNotice = () => {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setDismissed(true)
    }
  }, [])

  if (user || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm">
          <strong className="font-semibold">Welcome to DCC Court.</strong>{' '}
          Create an account to file cases, vote, and join community discussions.
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold px-3 py-1.5 rounded-md bg-white text-blue-700 hover:bg-blue-50 transition-colors"
          >
            Sign up
          </Link>
          <button
            onClick={handleDismiss}
            className="ml-1 p-1 rounded-full hover:bg-white/15 transition-colors"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default GuestNotice
