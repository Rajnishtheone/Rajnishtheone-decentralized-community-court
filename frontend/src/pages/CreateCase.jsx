import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Upload, FileText } from 'lucide-react'

const CreateCase = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const createCaseMutation = useMutation(
    async (formData) => {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      if (selectedFile) {
        data.append('evidence', selectedFile)
      }
      
      const response = await api.post('/cases', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Case created successfully!')
        queryClient.invalidateQueries('cases')
        navigate('/cases')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create case')
      },
    }
  )

  const onSubmit = (data) => {
    createCaseMutation.mutate(data)
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Case</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="form-label">
              Case Title
            </label>
            <input
              type="text"
              id="title"
              className={`form-input ${errors.title ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              placeholder="Enter case title"
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 5,
                  message: 'Title must be at least 5 characters',
                },
              })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="form-label">
              Case Description
            </label>
            <textarea
              id="description"
              rows={6}
              className={`form-textarea ${errors.description ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              placeholder="Provide a detailed description of the case..."
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters',
                },
              })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="evidence" className="form-label">
              Evidence (Optional)
            </label>
            <div className="mt-2 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/80 dark:bg-slate-950/40">
              <div className="space-y-2 text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex flex-col sm:flex-row items-center justify-center text-sm text-slate-600 dark:text-slate-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-blue-600 hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            </div>
            {selectedFile && (
              <div className="mt-2 flex items-center text-sm text-slate-600 dark:text-slate-300">
                <FileText className="h-4 w-4 mr-1" />
                {selectedFile.name}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/cases')}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCaseMutation.isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {createCaseMutation.isLoading ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCase 
