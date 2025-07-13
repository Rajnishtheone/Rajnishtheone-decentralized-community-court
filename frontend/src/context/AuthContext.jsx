// src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axiosInstance from '../lib/axiosInstance.js'

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
  const [loading, setLoading] = useState(true);
  const [googleData, setGoogleData] = useState(null);
  const navigate = useNavigate()

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await axiosInstance.get('/users/profile/me');
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('token')
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

      const response = await axiosInstance.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const { token, user: userDataFromResponse } = response.data
      localStorage.setItem('token', token)
      setUser(userDataFromResponse)
      return { success: true }
    } catch (error) {
      console.error('Registration error in AuthContext:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const login = async (email, password, role) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password, role })
      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      setUser(userData)
      return { success: true, user: userData }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const googleLogin = async (credentialResponse) => {
    try {
      const response = await axiosInstance.post('/auth/google', { credential: credentialResponse.credential })
      const { token, user: userData, requiresProfileCompletion } = response.data
      
      if (requiresProfileCompletion) {
        setGoogleData(userData)
        return { success: true, requiresProfileCompletion: true }
      }
      
      localStorage.setItem('token', token)
      setUser(userData)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Google login failed' 
      }
    }
  }

  const completeGoogleProfile = async (userData) => {
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

      const response = await axiosInstance.post('/auth/complete-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const { token, user: userDataFromResponse } = response.data
      localStorage.setItem('token', token)
      setUser(userDataFromResponse)
      setGoogleData(null)
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile completion failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setGoogleData(null)
    navigate('/')
    toast.success('Logged out successfully')
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

      const response = await axiosInstance.put('/users/update/me', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      })

      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axiosInstance.put('/users/change-password', { currentPassword, newPassword })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Password change failed' 
      }
    }
  }

  const requestJudgeRole = async (reason) => {
    try {
      await axiosInstance.post('/users/request-judge', { reason })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Judge request failed' 
      }
    }
  }

  const forgotPassword = async (email) => {
    try {
      await axiosInstance.post('/users/forgot-password', { email })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Password reset failed' 
      }
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      await axiosInstance.post('/users/reset-password', { token, newPassword })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Password reset failed' 
      }
    }
  }

  const value = {
    user,
    loading,
    googleData,
    register,
    login,
    googleLogin,
    completeGoogleProfile,
    logout,
    updateProfile,
    changePassword,
    requestJudgeRole,
    forgotPassword,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
