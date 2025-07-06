import { Link } from 'react-router-dom'
import { Scale, Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-border dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">DCC</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
              Decentralized Community Court - Empowering communities through democratic justice, 
              AI-assisted verdicts, and transparent legal processes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cases" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Cases
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <Mail className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                support@dcc.com
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <Phone className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                123 Justice St, Legal City
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-zinc-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              © {currentYear} Decentralized Community Court. All rights reserved.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 md:mt-0">
              Designed & Developed with ❤️ by <span className="font-semibold text-primary-600 dark:text-primary-400">Rajanish Kumar</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 