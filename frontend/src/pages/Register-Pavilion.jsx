import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, Calendar, Scale, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const Register = () => {
  const [step, setStep] = useState(1)
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
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [age, setAge] = useState('')
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })

    // Calculate age when date of birth changes
    if (name === 'dateOfBirth' && value) {
      const today = new Date()
      const birthDate = new Date(value)
      let calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--
      }
      
      setAge(calculatedAge.toString())
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error('Please fill in all fields')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.acceptTerms) {
      toast.error('Please accept the terms and conditions')
      return
    }

    if (parseInt(age) < 18) {
      toast.error('You must be at least 18 years old to register')
      return
    }

    setIsLoading(true)
    
    try {
      await register(formData)
      toast.success('Registration successful! Please check your email.')
      navigate('/login')
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Username input */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="peer block min-h-[auto] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-4 leading-[2.15] outline-none transition-all duration-200 ease-linear focus:border-blue-500 focus:placeholder:opacity-100 peer-focus:text-blue-500 data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-gray-400 dark:autofill:shadow-autofill dark:peer-focus:text-blue-400 [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                  placeholder="Username"
                  required
                />
                <label className="pointer-events-none absolute left-4 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-4 leading-[2.15] text-gray-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-blue-500 peer-data-[twe-input-state-active]:-translate-y-[1.15rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-gray-400 dark:peer-focus:text-blue-400">
                  Username
                </label>
                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Email input */}
            <div className="relative">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="peer block min-h-[auto] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-4 leading-[2.15] outline-none transition-all duration-200 ease-linear focus:border-blue-500 focus:placeholder:opacity-100 peer-focus:text-blue-500 data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-gray-400 dark:autofill:shadow-autofill dark:peer-focus:text-blue-400 [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                  placeholder="Email address"
                  required
                />
                <label className="pointer-events-none absolute left-4 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-4 leading-[2.15] text-gray-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-blue-500 peer-data-[twe-input-state-active]:-translate-y-[1.15rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-gray-400 dark:peer-focus:text-blue-400">
                  Email address
                </label>
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password input */}
            <div className="relative">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="peer block min-h-[auto] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-4 leading-[2.15] outline-none transition-all duration-200 ease-linear focus:border-blue-500 focus:placeholder:opacity-100 peer-focus:text-blue-500 data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-gray-400 dark:autofill:shadow-autofill dark:peer-focus:text-blue-400 [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                  placeholder="Password"
                  required
                />
                <label className="pointer-events-none absolute left-4 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-4 leading-[2.15] text-gray-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-blue-500 peer-data-[twe-input-state-active]:-translate-y-[1.15rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-gray-400 dark:peer-focus:text-blue-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password input */}
            <div className="relative">
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="peer block min-h-[auto] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-4 leading-[2.15] outline-none transition-all duration-200 ease-linear focus:border-blue-500 focus:placeholder:opacity-100 peer-focus:text-blue-500 data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-gray-400 dark:autofill:shadow-autofill dark:peer-focus:text-blue-400 [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                  placeholder="Confirm Password"
                  required
                />
                <label className="pointer-events-none absolute left-4 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-4 leading-[2.15] text-gray-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-blue-500 peer-data-[twe-input-state-active]:-translate-y-[1.15rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-gray-400 dark:peer-focus:text-blue-400">
                  Confirm Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={handleNext}
              className="inline-block w-full rounded-lg bg-blue-600 hover:bg-blue-700 px-7 pb-3 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-lg transition duration-150 ease-in-out hover:shadow-xl focus:bg-blue-700 focus:shadow-xl focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong flex items-center justify-center"
            >
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            {/* Phone input */}
            <div className="relative">
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="peer block min-h-[auto] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-4 leading-[2.15] outline-none transition-all duration-200 ease-linear focus:border-blue-500 focus:placeholder:opacity-100 peer-focus:text-blue-500 data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-gray-400 dark:autofill:shadow-autofill dark:peer-focus:text-blue-400 [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                  placeholder="Phone number"
                  pattern="[0-9]{10}"
                  maxLength="10"
                />
                <label className="pointer-events-none absolute left-4 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-4 leading-[2.15] text-gray-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-blue-500 peer-data-[twe-input-state-active]:-translate-y-[1.15rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-gray-400 dark:peer-focus:text-blue-400">
                  Phone number
                </label>
                <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Building and Flat */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleChange}
                    className="peer block min-h-[auto] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-4 leading-[2.15] outline-none transition-all duration-200 ease-linear focus:border-blue-500 focus:placeholder:opacity-100 peer-focus:text-blue-500 data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-gray-400 dark:autofill:shadow-autofill dark:peer-focus:text-blue-400 [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                    placeholder="Building"
                  />
                  <label className="pointer-events-none absolute left-4 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-4 leading-[2.15] text-gray-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-blue-500 peer-data-[twe-input-state-active]:-translate-y-[1.15rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-gray-400 dark:peer-focus:text-blue-400">
                    Building
                  </label>
                  <Building className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    name="flat"
                    value={formData.flat}
                    onChange={handleChange}
                    className="peer block min-h-[auto] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-4 leading-[2.15] outline-none transition-all duration-200 ease-linear focus:border-blue-500 focus:placeholder:opacity-100 peer-focus:text-blue-500 data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-gray-400 dark:autofill:shadow-autofill dark:peer-focus:text-blue-400 [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                    placeholder="Flat"
                  />
                  <label className="pointer-events-none absolute left-4 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-4 leading-[2.15] text-gray-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-blue-500 peer-data-[twe-input-state-active]:-translate-y-[1.15rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-gray-400 dark:peer-focus:text-blue-400">
                    Flat
                  </label>
                  <Building className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="relative">
              <div className="relative">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="peer block min-h-[auto] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-4 leading-[2.15] outline-none transition-all duration-200 ease-linear focus:border-blue-500 focus:placeholder:opacity-100 peer-focus:text-blue-500 data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-gray-400 dark:autofill:shadow-autofill dark:peer-focus:text-blue-400 [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                  required
                />
                <label className="pointer-events-none absolute left-4 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-4 leading-[2.15] text-gray-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-blue-500 peer-data-[twe-input-state-active]:-translate-y-[1.15rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-gray-400 dark:peer-focus:text-blue-400">
                  Date of Birth
                </label>
                <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {age && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Age: {age} years old
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="relative">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="peer block min-h-[auto] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-4 leading-[2.15] outline-none transition-all duration-200 ease-linear focus:border-blue-500 focus:placeholder:opacity-100 peer-focus:text-blue-500 data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-gray-400 dark:autofill:shadow-autofill dark:peer-focus:text-blue-400"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <label className="pointer-events-none absolute left-4 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-4 leading-[2.15] text-gray-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-blue-500 peer-data-[twe-input-state-active]:-translate-y-[1.15rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-gray-400 dark:peer-focus:text-blue-400">
                Gender
              </label>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                className="relative float-left me-3 mt-1 h-4 w-4 appearance-none rounded border border-gray-300 dark:border-gray-600 outline-none before:pointer-events-none before:absolute before:h-3 before:w-3 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] checked:border-blue-500 checked:bg-blue-500 checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ms-[0.25rem] checked:after:block checked:after:h-2 checked:after:w-1 checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-3 focus:after:w-3 focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ms-[0.25rem] checked:focus:after:h-2 checked:focus:after:w-1 checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent rtl:float-right dark:border-gray-400 dark:checked:border-blue-500 dark:checked:bg-blue-500"
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                id="acceptTerms"
              />
              <label
                className="inline-block text-sm text-gray-700 dark:text-gray-300 hover:cursor-pointer"
                htmlFor="acceptTerms"
              >
                I accept the{' '}
                <Link
                  to="/terms"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Terms and Conditions
                </Link>
              </label>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 px-7 pb-3 pt-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition duration-150 ease-in-out"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 px-7 pb-3 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-lg transition duration-150 ease-in-out hover:shadow-xl focus:bg-blue-700 focus:shadow-xl focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container h-full px-6 py-24">
        <div className="flex h-full flex-wrap items-center justify-center lg:justify-between">
          
          {/* Left column container with background */}
          <motion.div 
            className="mb-12 md:mb-0 md:w-8/12 lg:w-6/12"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-8">
                <div className="p-3 bg-blue-600 rounded-xl mr-4">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  DCC Court
                </h1>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Join Our <br />
                <span className="text-blue-600 dark:text-blue-400">Community Justice</span>
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
                Become a member of our decentralized community court and help maintain harmony through fair and transparent justice.
              </p>

              {/* Progress indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-center lg:justify-start space-x-4">
                  <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                      1
                    </div>
                    <span className="ml-2 text-sm font-medium">Account</span>
                  </div>
                  <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                      2
                    </div>
                    <span className="ml-2 text-sm font-medium">Profile</span>
                  </div>
                </div>
              </div>

              {/* Illustration */}
              <div className="hidden lg:block">
                <img
                  src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                  className="w-full max-w-md mx-auto"
                  alt="Justice illustration"
                />
              </div>
            </div>
          </motion.div>

          {/* Right column container with form */}
          <motion.div 
            className="md:w-8/12 lg:ms-6 lg:w-5/12"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {step === 1 ? 'Create Account' : 'Complete Profile'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step === 1 ? 'Step 1: Enter your basic information' : 'Step 2: Add your profile details'}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {renderStepContent(step)}
              </form>

              {/* Login link */}
              <div className="text-center mt-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Register 