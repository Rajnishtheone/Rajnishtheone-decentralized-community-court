import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { Search, User, MapPin, Phone, Mail, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const Verifications = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCase, setSelectedCase] = useState(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verificationData, setVerificationData] = useState({
    verifiedTargetId: '',
    verificationNotes: '',
    action: 'verify'
  })
  
  const queryClient = useQueryClient()

  // Fetch pending verifications
  const { data: verifications, isLoading } = useQuery(
    'pendingVerifications',
    async () => {
      const response = await api.get('/cases/verifications/pending')
      return response.data.cases
    }
  )

  // Fetch all users for target selection
  const { data: users } = useQuery(
    'users',
    async () => {
      const response = await api.get('/users')
      return response.data.users
    }
  )

  // Verify case mutation
  const verifyCaseMutation = useMutation(
    async ({ caseId, data }) => {
      const response = await api.post(`/cases/${caseId}/verify`, data)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Case verification completed successfully')
        queryClient.invalidateQueries('pendingVerifications')
        setShowVerifyModal(false)
        setSelectedCase(null)
        setVerificationData({
          verifiedTargetId: '',
          verificationNotes: '',
          action: 'verify'
        })
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to verify case')
      }
    }
  )

  const handleVerify = (caseItem) => {
    setSelectedCase(caseItem)
    setShowVerifyModal(true)
  }

  const handleSubmitVerification = () => {
    if (!selectedCase) return

    verifyCaseMutation.mutate({
      caseId: selectedCase._id,
      data: verificationData
    })
  }

  const filteredVerifications = verifications?.filter(caseItem =>
    caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.filedBy?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pending Verifications
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Review and verify cases that require manual verification.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search cases by title, description, or filer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-10"
          />
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVerifications.map((caseItem) => (
          <div key={caseItem._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {caseItem.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {caseItem.description}
                </p>
              </div>
              <div className="ml-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </span>
              </div>
            </div>

            {/* Filer Info */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Filed by: {caseItem.filedBy?.username}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(caseItem.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Target Information */}
            {caseItem.targetInfo && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Target Information
                </h4>
                <div className="space-y-1 text-xs">
                  {caseItem.targetInfo.name && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 text-blue-600 mr-1" />
                      <span className="text-blue-800 dark:text-blue-200">{caseItem.targetInfo.name}</span>
                    </div>
                  )}
                  {caseItem.targetInfo.email && (
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 text-blue-600 mr-1" />
                      <span className="text-blue-800 dark:text-blue-200">{caseItem.targetInfo.email}</span>
                    </div>
                  )}
                  {caseItem.targetInfo.phone && (
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 text-blue-600 mr-1" />
                      <span className="text-blue-800 dark:text-blue-200">{caseItem.targetInfo.phone}</span>
                    </div>
                  )}
                  {caseItem.targetInfo.building && caseItem.targetInfo.flat && (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 text-blue-600 mr-1" />
                      <span className="text-blue-800 dark:text-blue-200">
                        {caseItem.targetInfo.building} - {caseItem.targetInfo.flat}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleVerify(caseItem)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Review & Verify
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredVerifications.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No pending verifications
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            All cases have been verified or there are no cases requiring manual verification.
          </p>
        </div>
      )}

      {/* Verification Modal */}
      {showVerifyModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Verify Case: {selectedCase.title}
                </h2>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Case Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Case Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <strong>Description:</strong> {selectedCase.description}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <strong>Filed by:</strong> {selectedCase.filedBy?.username}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Filed on:</strong> {new Date(selectedCase.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Target Information */}
                {selectedCase.targetInfo && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Target Information
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      {Object.entries(selectedCase.targetInfo).map(([key, value]) => 
                        value && (
                          <p key={key} className="text-blue-800 dark:text-blue-200 mb-1">
                            <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Verification Action */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Verification Action
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Action
                      </label>
                      <select
                        value={verificationData.action}
                        onChange={(e) => setVerificationData({
                          ...verificationData,
                          action: e.target.value
                        })}
                        className="input w-full"
                      >
                        <option value="verify">Verify Target</option>
                        <option value="reject">Reject Verification</option>
                      </select>
                    </div>

                    {verificationData.action === 'verify' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Select Target User
                        </label>
                        <select
                          value={verificationData.verifiedTargetId}
                          onChange={(e) => setVerificationData({
                            ...verificationData,
                            verifiedTargetId: e.target.value
                          })}
                          className="input w-full"
                        >
                          <option value="">Select a user...</option>
                          {users?.map(user => (
                            <option key={user._id} value={user._id}>
                              {user.username} ({user.email}) - {user.building} {user.flat}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Verification Notes
                      </label>
                      <textarea
                        value={verificationData.verificationNotes}
                        onChange={(e) => setVerificationData({
                          ...verificationData,
                          verificationNotes: e.target.value
                        })}
                        rows={3}
                        className="input w-full"
                        placeholder="Add notes about the verification process..."
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitVerification}
                    disabled={verifyCaseMutation.isLoading || (verificationData.action === 'verify' && !verificationData.verifiedTargetId)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {verifyCaseMutation.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        {verificationData.action === 'verify' ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify Case
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Verification
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Verifications 