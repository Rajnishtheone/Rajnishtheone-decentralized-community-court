// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // will store name/email/id
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      checkAuthStatus()
    } else {
      setLoading(false)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/users/profile/me')
      setUser(response.data)
      setIsAuthenticated(true)
    } catch (error) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      const formData = new FormData()
      
      // Add all user data to formData
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
          if (key === 'profilePic' && userData[key] instanceof File) {
            formData.append('profilePic', userData[key])
          } else {
            formData.append(key, userData[key])
          }
        }
      })

      const response = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Automatically log in after registration
      const { token, user } = response.data
      if (token && user) {
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        setIsAuthenticated(true)
      }
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  const login = async (email, password, role = 'member') => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        role
      })

      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(user)
      setIsAuthenticated(true)
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
    navigate('/')
  }

  const updateProfile = async (userData) => {
    try {
      const formData = new FormData()
      
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
          if (key === 'profilePic' && userData[key] instanceof File) {
            formData.append('profilePic', userData[key])
          } else {
            formData.append(key, userData[key])
          }
        }
      })

      const response = await api.put('/users/update/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setUser(response.data.user)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile update failed')
    }
  }

  const requestJudgeRole = async (reason) => {
    try {
      const response = await api.post('/users/request-judge', { reason })
      setUser(response.data.user)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Judge request failed')
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed')
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed')
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    updateProfile,
    requestJudgeRole,
    forgotPassword,
    resetPassword,
    isAdmin: user?.role === 'admin',
    isJudge: user?.role === 'judge',
    isMember: user?.role === 'member',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
