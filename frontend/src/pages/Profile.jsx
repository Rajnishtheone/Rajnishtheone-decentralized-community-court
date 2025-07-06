import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import JudgeRequest from '../components/JudgeRequest'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showJudgeRequest, setShowJudgeRequest] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(user?.profilePic || '')
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      building: user?.building || '',
      flat: user?.flat || '',
      gender: user?.gender || 'male'
    }
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const formData = {
        ...data,
        profilePic: selectedFile
      }
      
      await updateProfile(formData)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getJudgeRequestStatus = () => {
    switch (user?.judgeRequestStatus) {
      case 'pending':
        return { text: 'Pending Review', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20' }
      case 'approved':
        return { text: 'Approved', color: 'text-green-600 bg-green-100 dark:bg-green-900/20' }
      case 'rejected':
        return { text: 'Rejected', color: 'text-red-600 bg-red-100 dark:bg-red-900/20' }
      default:
        return null
    }
  }

  const judgeStatus = getJudgeRequestStatus()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={previewUrl || '/default-avatar.png'}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
                <p className="text-indigo-100">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </span>
                  {judgeStatus && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${judgeStatus.color}`}>
                      {judgeStatus.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Form */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Profile Information
                </h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.name
                            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.email
                            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        {...register('phone', { 
                          required: 'Phone number is required',
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Please enter a valid 10-digit phone number'
                          }
                        })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.phone
                            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Gender
                      </label>
                      <select
                        {...register('gender', { required: 'Gender is required' })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 transition-colors"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Building
                      </label>
                      <input
                        type="text"
                        {...register('building', { required: 'Building is required' })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.building
                            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                      />
                      {errors.building && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.building.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Flat Number
                      </label>
                      <input
                        type="text"
                        {...register('flat', { required: 'Flat number is required' })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                          errors.flat
                            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                      />
                      {errors.flat && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.flat.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </div>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </form>
              </div>

              {/* Stats and Actions */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Statistics
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm opacity-90">Cases Filed</p>
                          <p className="text-2xl font-bold">{user?.casesFiled || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm opacity-90">Win Rate</p>
                          <p className="text-2xl font-bold">{user?.winRate || 0}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm opacity-90">Reputation</p>
                          <p className="text-2xl font-bold">{user?.reputation || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                      <div className="flex items-center">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm opacity-90">Total Votes</p>
                          <p className="text-2xl font-bold">{user?.totalVotes || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Judge Request Section */}
                {user?.role === 'member' && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Become a Judge
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Judges have the authority to preside over cases and make final decisions. Request to become a judge if you have the necessary qualifications.
                    </p>
                    
                    {user?.judgeRequestStatus === 'none' && (
                      <button
                        onClick={() => setShowJudgeRequest(true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Request Judge Role
                      </button>
                    )}
                    
                    {user?.judgeRequestStatus === 'pending' && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Request Pending Review
                        </div>
                      </div>
                    )}
                    
                    {user?.judgeRequestStatus === 'rejected' && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                          Request Rejected
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          You can submit a new request after 30 days.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showJudgeRequest && (
        <JudgeRequest
          onClose={() => setShowJudgeRequest(false)}
          onSuccess={() => {
            // Refresh user data
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

export default Profile 