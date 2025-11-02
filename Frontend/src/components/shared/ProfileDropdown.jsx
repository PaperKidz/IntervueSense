import { useState, useEffect, useRef } from 'react';
import { User, LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import API_CONFIG from '../../config/api.config';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    avatar: null
  });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load user data and listen for changes
  useEffect(() => {
    const loadUserData = () => {
      const user = authService.getCurrentUser();
      if (user) {
        setUserData({
          name: user.name || user.username || 'User',
          email: user.email || '',
          avatar: user.avatar || null
        });
      }
    };

    // Load initial data
    loadUserData();

    // Listen for storage changes (updates from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === null) {
        loadUserData();
      }
    };

    // Listen for custom auth changes (updates from same tab)
    const handleAuthChange = () => {
      loadUserData();
    };

    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('profileUpdate', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('profileUpdate', handleProfileUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate color from name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const handleLogout = () => {
    authService.logout();
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // TODO: Implement dark mode in Phase 2
    console.log('Dark mode toggled:', !darkMode);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {userData.avatar ? (
          <img
            src={`${API_CONFIG.BASE_URL}${userData.avatar}`}
            alt={userData.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className={`w-10 h-10 rounded-full ${getAvatarColor(userData.name)} flex items-center justify-center text-white font-semibold`}>
            {getInitials(userData.name)}
          </div>
        )}
        <span className="hidden md:block text-sm font-medium text-gray-700">{userData.name}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              {userData.avatar ? (
                <img
                  src={`${API_CONFIG.BASE_URL}${userData.avatar}`}
                  alt={userData.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className={`w-12 h-12 rounded-full ${getAvatarColor(userData.name)} flex items-center justify-center text-white font-semibold text-lg`}>
                  {getInitials(userData.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userData.name}</p>
                <p className="text-xs text-gray-500 truncate">{userData.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <User size={16} />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>Dark Mode</span>
              <span className="ml-auto text-xs text-gray-400">(Coming Soon)</span>
            </button>

            <hr className="my-2" />

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}