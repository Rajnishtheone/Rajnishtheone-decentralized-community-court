import { X } from 'lucide-react'

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Terms and Conditions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold mb-4">1. Acceptance of Terms</h3>
            <p className="mb-4">
              By accessing and using the Decentralized Community Court (DCC) platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h3 className="text-lg font-semibold mb-4">2. Description of Service</h3>
            <p className="mb-4">
              DCC provides a platform for community-driven legal processes, including case filing, voting, and AI-assisted verdict suggestions. The platform facilitates democratic justice through transparent and collaborative decision-making.
            </p>

            <h3 className="text-lg font-semibold mb-4">3. User Responsibilities</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide accurate and truthful information during registration and case submissions</li>
              <li>Respect the rights and privacy of other users</li>
              <li>Not engage in any form of harassment, discrimination, or illegal activities</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Report any suspicious or inappropriate behavior to administrators</li>
            </ul>

            <h3 className="text-lg font-semibold mb-4">4. Case Submission Guidelines</h3>
            <p className="mb-4">
              All cases submitted must be based on real community issues and concerns. Users are prohibited from submitting frivolous, malicious, or fabricated cases. Each case should include relevant evidence and documentation when available.
            </p>

            <h3 className="text-lg font-semibold mb-4">5. Voting and Decision Making</h3>
            <p className="mb-4">
              Voting is a fundamental aspect of the DCC platform. Users must vote responsibly and consider all available information before making decisions. The platform uses AI assistance to provide balanced perspectives, but final decisions rest with the community.
            </p>

            <h3 className="text-lg font-semibold mb-4">6. Privacy and Data Protection</h3>
            <p className="mb-4">
              We are committed to protecting your privacy. Personal information collected during registration and case submissions will be used solely for platform functionality and will not be shared with third parties without your explicit consent.
            </p>

            <h3 className="text-lg font-semibold mb-4">7. Intellectual Property</h3>
            <p className="mb-4">
              All content submitted to the platform remains the property of the submitting user. However, by submitting content, users grant DCC a non-exclusive license to display and process the content for platform functionality.
            </p>

            <h3 className="text-lg font-semibold mb-4">8. Dispute Resolution</h3>
            <p className="mb-4">
              Any disputes arising from the use of this platform will be resolved through the platform's internal dispute resolution mechanisms. Users agree to participate in good faith in any such proceedings.
            </p>

            <h3 className="text-lg font-semibold mb-4">9. Limitation of Liability</h3>
            <p className="mb-4">
              DCC is not liable for any damages arising from the use of the platform, including but not limited to direct, indirect, incidental, or consequential damages. The platform is provided "as is" without warranties of any kind.
            </p>

            <h3 className="text-lg font-semibold mb-4">10. Modifications to Terms</h3>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of modified terms.
            </p>

            <h3 className="text-lg font-semibold mb-4">11. Termination</h3>
            <p className="mb-4">
              We reserve the right to terminate or suspend user accounts for violations of these terms. Users may also terminate their accounts at any time by contacting support.
            </p>

            <h3 className="text-lg font-semibold mb-4">12. Governing Law</h3>
            <p className="mb-4">
              These terms are governed by the laws of the jurisdiction in which DCC operates. Any legal proceedings will be conducted in the appropriate courts of that jurisdiction.
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-zinc-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}

export default TermsModal 