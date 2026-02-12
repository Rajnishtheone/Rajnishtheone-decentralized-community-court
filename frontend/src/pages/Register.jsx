import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext.jsx'
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, Calendar, ArrowLeft, Scale, AlertCircle, Upload, CheckCircle } from 'lucide-react'
import TermsModal from '../components/TermsModal'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import api from '../lib/api'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    building: '',
    flat: '',
    dateOfBirth: '',
    gender: '',
    role: 'member'
  })
  const [isFirstUser, setIsFirstUser] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showTerms, setShowTerms] = useState(false)
  const [profilePic, setProfilePic] = useState(null)
  const [profilePicPreview, setProfilePicPreview] = useState('')

  const { register, googleLogin } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const response = await api.get('/analytics/community-stats')
        const totalUsers = response.data?.community?.totalUsers || 0
        if (totalUsers === 0) {
          setIsFirstUser(true)
          setFormData(prev => ({ ...prev, role: 'admin' }))
        }
      } catch (error) {
        console.log('Could not check user count, defaulting to member role')
      }
    }

    checkFirstUser()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePic(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name) {
      newErrors.name = 'Name is required'
    }

    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits'
    }

    if (!formData.building) {
      newErrors.building = 'Building is required'
    }

    if (!formData.flat) {
      newErrors.flat = 'Flat number is required'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    if (!formData.role) {
      newErrors.role = 'Role is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const userData = {
        ...formData,
        profilePic: profilePic
      }

      const result = await register(userData)

      if (result.success) {
        toast.success('Registration successful!')
        navigate('/dashboard')
      } else {
        toast.error(result.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await googleLogin(credentialResponse)

      if (result.success) {
        if (result.requiresProfileCompletion) {
          toast.success('Please complete your profile')
        } else {
          toast.success('Google registration successful!')
          navigate('/dashboard')
        }
      } else {
        toast.error(result.error || 'Google registration failed')
      }
    } catch (error) {
      toast.error('An error occurred during Google registration')
    }
  }

  const handleGoogleError = () => {
    toast.error('Google registration failed. Please try again.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 text-white">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-white/10 rounded-full">
                <Scale className="h-7 w-7" />
              </div>
              <span className="text-2xl font-semibold">DCC Court</span>
            </div>
            <h2 className="text-3xl font-semibold leading-tight">Create your community account.</h2>
            <p className="mt-4 text-white/80">
              Join neighbors, judges, and admins who collaborate to resolve disputes with transparency.
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                File cases and add evidence securely
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Vote on published cases with AI insights
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Request judge access with admin approval
              </div>
            </div>
          </div>
          <div className="text-xs text-white/70">
            Already a member? Sign in to continue.
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Your Account</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join DCC Court and participate in fair community justice
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="form-label">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profilePic"
                  />
                  <label
                    htmlFor="profilePic"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </label>
                </div>
                {profilePicPreview && (
                  <img
                    src={profilePicPreview}
                    alt="Profile preview"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input pl-10 pr-3 ${errors.name ? 'border-red-300 dark:border-red-600' : ''}`}
                  placeholder="Enter your name"
                />
              </div>
              {errors.name && (
                <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`form-input pl-10 pr-3 ${errors.username ? 'border-red-300 dark:border-red-600' : ''}`}
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.username}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input pl-10 pr-3 ${errors.email ? 'border-red-300 dark:border-red-600' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input pl-10 pr-10 ${errors.password ? 'border-red-300 dark:border-red-600' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300 dark:border-red-600' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input pl-10 pr-3 ${errors.phone ? 'border-red-300 dark:border-red-600' : ''}`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="building" className="form-label">
                  Building
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="building"
                    name="building"
                    type="text"
                    required
                    value={formData.building}
                    onChange={handleChange}
                    className={`form-input pl-10 pr-3 ${errors.building ? 'border-red-300 dark:border-red-600' : ''}`}
                    placeholder="Building name/number"
                  />
                </div>
                {errors.building && (
                  <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.building}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="flat" className="form-label">
                  Flat Number
                </label>
                <input
                  id="flat"
                  name="flat"
                  type="text"
                  required
                  value={formData.flat}
                  onChange={handleChange}
                  className={`form-input ${errors.flat ? 'border-red-300 dark:border-red-600' : ''}`}
                  placeholder="Flat number"
                />
                {errors.flat && (
                  <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.flat}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateOfBirth" className="form-label">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`form-input pl-10 pr-3 ${errors.dateOfBirth ? 'border-red-300 dark:border-red-600' : ''}`}
                  />
                </div>
                {errors.dateOfBirth && (
                  <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.dateOfBirth}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="gender" className="form-label">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className={`form-input ${errors.gender ? 'border-red-300 dark:border-red-600' : ''}`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.gender}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="role" className="form-label">
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Scale className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`form-input pl-10 pr-3 ${errors.role ? 'border-red-300 dark:border-red-600' : ''}`}
                >
                  <option value="member">Community Member</option>
                  <option value="judge">Judge (requires approval)</option>
                  {isFirstUser && <option value="admin">Admin (First User)</option>}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {isFirstUser
                  ? "You're the first user. You can choose to be an admin with full system access."
                  : 'Judges must be approved by an admin before they can access the judge dashboard.'}
              </p>
              {errors.role && (
                <div className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.role}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          <div
            className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-sm"
            style={{ colorScheme: isDark ? 'dark' : 'light' }}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme={isDark ? 'filled_black' : 'outline'}
              size="large"
              text="signup_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our{' '}
              <button
                onClick={() => setShowTerms(true)}
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  )
}

export default Register
