import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, Calendar, Upload, ArrowLeft, Scale, AlertCircle, CheckCircle } from 'lucide-react'
import TermsModal from '../components/TermsModal'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    building: '',
    flat: '',
    dateOfBirth: '',
    gender: '',
    profilePic: null
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showTerms, setShowTerms] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, files } = e.target
    
    if (name === 'profilePic' && files[0]) {
      const file = files[0]
      setFormData(prev => ({ ...prev, profilePic: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setPreviewImage(e.target.result)
      reader.readAsDataURL(file)
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!acceptedTerms) {
      setError('Please accept the Terms and Conditions')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        building: formData.building,
        flat: formData.flat,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        profilePic: formData.profilePic
      }

      await register(userData)
      setSuccess('Registration successful! Redirecting to login...')
      
      // Auto-login after successful registration
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <Scale className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Join DCC Community
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Create your account to participate in community justice
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 placeholder-gray-500 dark:placeholder-zinc-400 text-gray-900 dark:text-white bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
                    placeholder="Choose a username"
                  />
                  <User className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 placeholder-gray-500 dark:placeholder-zinc-400 text-gray-900 dark:text-white bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 placeholder-gray-500 dark:placeholder-zinc-400 text-gray-900 dark:text-white bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
                    placeholder="10-digit phone number"
                  />
                  <Phone className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Building */}
              <div>
                <label htmlFor="building" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Building Name *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="building"
                    name="building"
                    type="text"
                    required
                    value={formData.building}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 placeholder-gray-500 dark:placeholder-zinc-400 text-gray-900 dark:text-white bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
                    placeholder="Enter building name"
                  />
                  <Building className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Flat */}
              <div>
                <label htmlFor="flat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Flat Number *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="flat"
                    name="flat"
                    type="text"
                    required
                    value={formData.flat}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 placeholder-gray-500 dark:placeholder-zinc-400 text-gray-900 dark:text-white bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
                    placeholder="Enter flat number"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Birth *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-white bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gender *
                </label>
                <div className="mt-1 relative">
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-white bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 placeholder-gray-500 dark:placeholder-zinc-400 text-gray-900 dark:text-white bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 placeholder-gray-500 dark:placeholder-zinc-400 text-gray-900 dark:text-white bg-white dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile preview"
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-300 dark:border-zinc-600"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    id="profilePic"
                    name="profilePic"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="profilePic"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </label>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700 dark:text-gray-300">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline"
                  >
                    Terms and Conditions
                  </button>
                </label>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </>
  )
}

export default Register 