import { useState, useEffect } from 'react';
import { Sparkles, Menu, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(authService.isAuthenticated());
    };

    checkAuth();

    // Listen for storage changes (if user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);
    
    // Listen for custom auth events (optional, for same-tab login/logout)
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

  const handleLogout = () => {
    // Use the auth service logout method
    authService.logout();
    
    setIsLoggedIn(false);
    setMobileMenuOpen(false);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new Event('authChange'));
    
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => handleNavigate('/')}
          >
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">VirtueSense</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavigate('/Home')}
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigate('/maindash')}
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
            >
              Practice
            </button>
            <button
              onClick={() => handleNavigate('/theory')}
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
            >
              Theory
            </button>

            {/* Conditional rendering based on auth status */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <>
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleNavigate('/Home')}
                className="text-gray-700 hover:text-indigo-600 font-medium text-left"
              >
                Home
              </button>
              <button
                onClick={() => handleNavigate('/maindash')}
                className="text-gray-700 hover:text-indigo-600 font-medium text-left"
              >
                Practice
              </button>
              <button
                onClick={() => handleNavigate('/theory')}
                className="text-gray-700 hover:text-indigo-600 font-medium text-left"
              >
                Theory
              </button>
              
              {/* Conditional rendering for mobile */}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}