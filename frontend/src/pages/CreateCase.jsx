import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { Upload, FileText, User, MapPin, Clock, AlertCircle, CheckCircle, X } from 'lucide-react'

const CreateCase = () => {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [showTargetInfo, setShowTargetInfo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [backendErrors, setBackendErrors] = useState({})
  const abortControllerRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm()

  const createCaseMutation = useMutation(
    async (data) => {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()
      
      const formData = new FormData()
      
      // Add basic case info
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('category', data.category)
      formData.append('priority', data.priority)
      
      // Add target info if provided
      if (showTargetInfo) {
        if (data.targetName) formData.append('targetName', data.targetName)
        if (data.targetEmail) formData.append('targetEmail', data.targetEmail)
        if (data.targetPhone) formData.append('targetPhone', data.targetPhone)
        if (data.targetBuilding) formData.append('targetBuilding', data.targetBuilding)
        if (data.targetFlat) formData.append('targetFlat', data.targetFlat)
        if (data.physicalDescription) formData.append('physicalDescription', data.physicalDescription)
        if (data.location) formData.append('location', data.location)
        if (data.timeOfIncident) formData.append('timeOfIncident', data.timeOfIncident)
        if (data.frequency) formData.append('frequency', data.frequency)
      }
      
      // Add evidence file if selected
      if (selectedFile) {
        formData.append('evidence', selectedFile)
      }

      const response = await api.post('/cases', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: abortControllerRef.current.signal,
      })
      return response.data
    },
    {
      onSuccess: (data) => {
        toast.success('Case submitted successfully!')
        navigate('/cases')
      },
      onError: (error) => {
        if (error.name === 'AbortError') {
          toast.error('Case submission cancelled')
          return
        }
        
        // Handle backend validation errors
        if (error.response?.data?.errors) {
          const validationErrors = {}
          error.response.data.errors.forEach(err => {
            const field = err.path || err.field || 'general'
            validationErrors[field] = err.message
          })
          setBackendErrors(validationErrors)
          toast.error('Please fix the validation errors below')
        } else {
          toast.error(error.response?.data?.message || 'Failed to create case')
        }
      },
    }
  )

  const onSubmit = (data) => {
    setIsSubmitting(true)
    setBackendErrors({}) // Clear previous errors
    createCaseMutation.mutate(data)
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsSubmitting(false)
    setBackendErrors({})
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const categories = [
    'Civil', 'Criminal', 'Property', 'Family', 'Business', 
    'Noise', 'Parking', 'Maintenance', 'Security', 'Other'
  ]

  const priorities = ['Low', 'Medium', 'High', 'Urgent']

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          File a New Case
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Submit a case with evidence and optional target information for community review.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Case Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Case Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Case Title *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className={`input w-full ${backendErrors.title ? 'border-red-500' : ''}`}
                  placeholder="Brief description of the issue"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
                {backendErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{backendErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="input w-full"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className={`input w-full ${backendErrors.description ? 'border-red-500' : ''}`}
                placeholder="Provide detailed description of the incident, including dates, times, and any relevant context..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
              {backendErrors.description && (
                <p className="text-red-500 text-sm mt-1">{backendErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority Level
                </label>
                <select
                  {...register('priority')}
                  className="input w-full"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Evidence (Optional)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,video/*,.pdf"
                    className="hidden"
                    id="evidence"
                  />
                  <label
                    htmlFor="evidence"
                    className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {selectedFile.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Max 10MB. Supported: Images, Videos, PDF
                </p>
              </div>
            </div>
          </div>

          {/* Target Information Toggle */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Target Information
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Provide information about the person you're filing against (optional)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTargetInfo(!showTargetInfo)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showTargetInfo ? 'Hide' : 'Add Target Info'}
              </button>
            </div>
          </div>

          {/* Target Information Form */}
          {showTargetInfo && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Name
                  </label>
                  <input
                    type="text"
                    {...register('targetName')}
                    className={`input w-full ${backendErrors.targetName ? 'border-red-500' : ''}`}
                    placeholder="Full name if known"
                  />
                  {backendErrors.targetName && (
                    <p className="text-red-500 text-sm mt-1">{backendErrors.targetName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Email
                  </label>
                  <input
                    type="email"
                    {...register('targetEmail')}
                    className={`input w-full ${backendErrors.targetEmail ? 'border-red-500' : ''}`}
                    placeholder="Email address if known"
                  />
                  {backendErrors.targetEmail && (
                    <p className="text-red-500 text-sm mt-1">{backendErrors.targetEmail}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Phone
                  </label>
                  <input
                    type="tel"
                    {...register('targetPhone')}
                    className={`input w-full ${backendErrors.targetPhone ? 'border-red-500' : ''}`}
                    placeholder="Phone number if known"
                  />
                  {backendErrors.targetPhone && (
                    <p className="text-red-500 text-sm mt-1">{backendErrors.targetPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Building/Block
                  </label>
                  <input
                    type="text"
                    {...register('targetBuilding')}
                    className="input w-full"
                    placeholder="Building or block number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Flat/Apartment
                  </label>
                  <input
                    type="text"
                    {...register('targetFlat')}
                    className="input w-full"
                    placeholder="Flat or apartment number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    {...register('location')}
                    className="input w-full"
                    placeholder="Specific location of incident"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time of Incident
                  </label>
                  <input
                    type="text"
                    {...register('timeOfIncident')}
                    className="input w-full"
                    placeholder="When did this happen?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <input
                    type="text"
                    {...register('frequency')}
                    className="input w-full"
                    placeholder="How often does this occur?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Physical Description
                </label>
                <textarea
                  {...register('physicalDescription')}
                  rows={3}
                  className="input w-full"
                  placeholder="Physical description of the person (height, build, clothing, etc.)"
                />
              </div>
            </div>
          )}

          {/* Information Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  How the verification process works:
                </h3>
                <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• If you provide target information, we'll attempt automatic verification</li>
                  <li>• If automatic verification fails, judges will manually verify using community resources</li>
                  <li>• Once verified, the target will be notified and given 7 days to respond</li>
                  <li>• After response (or timeout), the case will be published for community voting</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            {isSubmitting ? (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Submission
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/cases')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Case'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCase 