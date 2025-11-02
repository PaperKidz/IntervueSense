import { useState, useEffect } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth.service';
import ProfileDropdown from './ProfileDropdown';

// Custom hook to get auth status for use in other components
export function useAuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(authService.isAuthenticated());
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChange', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  return isLoggedIn;
}

export default function NavBar({ onToggleSideNav, isSideNavOpen }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(authService.isAuthenticated());
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChange', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    
    if (location.pathname !== '/' && location.pathname !== '/Home') {
      navigate('/Home');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Hamburger (only when logged in) + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu - Shows only when logged in */}
              {isLoggedIn && (
                <button
                  onClick={() => window.toggleSideNav && window.toggleSideNav()}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu size={24} className="text-gray-700" />
                </button>
              )}

            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleNavigate('/Home')}
            >
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">VirtueSense</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isLoggedIn ? (
              // Logged in - show profile dropdown only
              <ProfileDropdown />
            ) : (
              // Not logged in - show section links
              <>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection('instructors')}
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
                >
                  Instructors
                </button>
                <button
                  onClick={() => handleNavigate('/login')}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigate('/signup')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Create Account
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Only for logged out users */}
          {!isLoggedIn && (
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          {/* Mobile Profile Dropdown - Only show when logged in */}
          {isLoggedIn && (
            <div className="md:hidden">
              <ProfileDropdown />
            </div>
          )}
        </div>

        {/* Mobile Menu - Only for logged out users */}
        {mobileMenuOpen && !isLoggedIn && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-indigo-600 font-medium text-left"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-700 hover:text-indigo-600 font-medium text-left"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('instructors')}
                className="text-gray-700 hover:text-indigo-600 font-medium text-left"
              >
                Instructors
              </button>
              <button
                onClick={() => handleNavigate('/login')}
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-left cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavigate('/signup')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}