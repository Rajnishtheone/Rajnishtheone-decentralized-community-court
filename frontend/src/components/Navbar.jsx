import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Scale, User, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { getProfilePicUrl } from '../utils/media';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close profile menu when route changes
  useEffect(() => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <nav className="bg-background border-b border-border shadow-sm theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">DCC Court</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="/#community" className="text-muted-foreground hover:text-foreground transition-colors">
                Community
              </a>
              <a href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
              {user && (
                <Link to="/social" className="text-muted-foreground hover:text-foreground transition-colors">
                  Social Circle
                </Link>
              )}
            </div>
          </div>

          {/* Right side - Navigation and user menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 theme-transition"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 p-2 rounded-md text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 theme-transition"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {user.profilePic ? (
                      <img
                        src={getProfilePicUrl(user.profilePic)}
                        alt={user.name || user.username}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.svg';
                        }}
                      />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user.name || user.username}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-50 theme-transition">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent theme-transition"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent theme-transition"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent theme-transition"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 space-y-3">
            <a href="/#features" className="block text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="block text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="/#community" className="block text-muted-foreground hover:text-foreground transition-colors">
              Community
            </a>
            <a href="/#contact" className="block text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
            {user && (
              <Link to="/social" className="block text-muted-foreground hover:text-foreground transition-colors">
                Social Circle
              </Link>
            )}
            {!user && (
              <div className="pt-3 flex items-center space-x-3">
                <Link to="/login" className="text-foreground hover:text-primary transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 
