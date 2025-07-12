import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { X, Info, Gavel } from 'lucide-react'

const JudgeRequest = ({ onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Call the onSuccess callback with the reason
      await onSuccess(data.reason)
    } catch (error) {
      console.error('Judge request error:', error)
      toast.error('Failed to submit judge request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 theme-transition">
      <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground flex items-center space-x-2">
            <Gavel className="h-5 w-5" />
            <span>Request Judge Role</span>
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-start p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex-shrink-0 mt-0.5">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-foreground">
                Judges have the authority to preside over cases and make final decisions. Please provide a compelling reason for your request.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-2">
              Reason for Request
            </label>
            <textarea
              id="reason"
              rows={4}
              {...register('reason', {
                required: 'Please provide a reason for your request',
                minLength: {
                  value: 20,
                  message: 'Reason must be at least 20 characters long'
                },
                maxLength: {
                  value: 500,
                  message: 'Reason cannot exceed 500 characters'
                }
              })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none ${
                errors.reason
                  ? 'border-destructive bg-destructive/10'
                  : 'border-border bg-background'
              }`}
              placeholder="Explain why you want to become a judge and what qualifies you for this role..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-destructive">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JudgeRequest 