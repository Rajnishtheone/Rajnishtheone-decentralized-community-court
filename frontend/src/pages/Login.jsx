import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Scale, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    try {
      await login(formData.email, formData.password)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    navigate('/forgot-password')
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
                Welcome Back to <br />
                <span className="text-blue-600 dark:text-blue-400">Community Justice</span>
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
                Access your account to file cases, participate in community decisions, and help maintain harmony in our society.
              </p>

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
                  Sign In
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your credentials to access your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    <label
                      className="pointer-events-none absolute left-4 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-4 leading-[2.15] text-gray-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-blue-500 peer-data-[twe-input-state-active]:-translate-y-[1.15rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-gray-400 dark:peer-focus:text-blue-400"
                    >
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
                    <label
                      className="pointer-events-none absolute left-4 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-4 leading-[2.15] text-gray-500 transition-all duration-200 ease-out peer-focus:-translate-y-[1.15rem] peer-focus:scale-[0.8] peer-focus:text-blue-500 peer-data-[twe-input-state-active]:-translate-y-[1.15rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-gray-400 dark:peer-focus:text-blue-400"
                    >
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

                {/* Remember me checkbox */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      className="relative float-left me-2 h-4 w-4 appearance-none rounded border border-gray-300 dark:border-gray-600 outline-none before:pointer-events-none before:absolute before:h-3 before:w-3 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] checked:border-blue-500 checked:bg-blue-500 checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ms-[0.25rem] checked:after:block checked:after:h-2 checked:after:w-1 checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-3 focus:after:w-3 focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ms-[0.25rem] checked:focus:after:h-2 checked:focus:after:w-1 checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent rtl:float-right dark:border-gray-400 dark:checked:border-blue-500 dark:checked:bg-blue-500"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      id="rememberMe"
                    />
                    <label
                      className="inline-block text-sm text-gray-700 dark:text-gray-300 hover:cursor-pointer"
                      htmlFor="rememberMe"
                    >
                      Remember me
                    </label>
                  </div>

                  {/* Forgot password link */}
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium focus:outline-none transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-block w-full rounded-lg bg-blue-600 hover:bg-blue-700 px-7 pb-3 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-lg transition duration-150 ease-in-out hover:shadow-xl focus:bg-blue-700 focus:shadow-xl focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-300 dark:before:border-gray-600 after:mt-0.5 after:flex-1 after:border-t after:border-gray-300 dark:after:border-gray-600">
                  <p className="mx-4 mb-0 text-center font-semibold text-gray-500 dark:text-gray-400">
                    OR
                  </p>
                </div>

                {/* Social login buttons */}
                <button
                  type="button"
                  className="mb-3 flex w-full items-center justify-center rounded-lg bg-[#3b5998] px-7 pb-3 pt-3 text-center text-sm font-medium uppercase leading-normal text-white shadow-lg transition duration-150 ease-in-out hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-0 active:shadow-xl"
                >
                  <svg
                    className="me-2 h-4 w-4 fill-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                  >
                    <path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
                  </svg>
                  Continue with Facebook
                </button>
                
                <button
                  type="button"
                  className="mb-3 flex w-full items-center justify-center rounded-lg bg-[#55acee] px-7 pb-3 pt-3 text-center text-sm font-medium uppercase leading-normal text-white shadow-lg transition duration-150 ease-in-out hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-0 active:shadow-xl"
                >
                  <svg
                    className="me-2 h-4 w-4 fill-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                  </svg>
                  Continue with X
                </button>

                {/* Register link */}
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Login 