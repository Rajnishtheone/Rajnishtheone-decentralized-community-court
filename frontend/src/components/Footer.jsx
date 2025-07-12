import React from 'react'
import { Link } from 'react-router-dom'
import { Scale, Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-border theme-transition">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Personal Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Rajnish Kumar
            </h3>
            <p className="text-muted-foreground mb-2">
              <a href="mailto:Rajnishkk97@gmail.com" className="hover:text-foreground transition-colors">Rajnishkk97@gmail.com</a> |
              <span className="ml-1">+91 9798669871</span>
            </p>
            {/* Removed text social links, only icons below */}
            <div className="flex space-x-4 mt-2">
              <a
                href="https://github.com/Rajnishtheone"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </a>
              <a
                href="https://linkedin.com/in/rajnish-kumar-11808a254"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="https://x.com/Rajnissh_?t=beCIHgXoq0cU0ivNEYlqBw&s=09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <span className="sr-only">Twitter/X</span>
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-5 w-5 mr-2" />
                <a href="mailto:Rajnishkk97@gmail.com" className="hover:text-foreground transition-colors duration-200">
                  Rajnishkk97@gmail.com
                </a>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-5 w-5 mr-2" />
                <a href="tel:+919798669871" className="hover:text-foreground transition-colors duration-200">
                  +91 9798669871
                </a>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2" />
                <span>Kochi, Kerala, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <div className="space-y-3">
              <Link to="/about" className="block text-muted-foreground hover:text-foreground transition-colors duration-200">
                About Us
              </Link>
              <Link to="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-muted-foreground hover:text-foreground transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/support" className="block text-muted-foreground hover:text-foreground transition-colors duration-200">
                Support
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 DCC Court. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm mt-2 md:mt-0">
              Built with ❤️ for community justice
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 