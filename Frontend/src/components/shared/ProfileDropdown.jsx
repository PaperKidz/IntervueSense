import { useState, useEffect, useRef } from 'react';
import { User, LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Get user data from auth service
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserName(user.name || user.username || 'User');
      setUserEmail(user.email || '');
    }
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
        <div className={`w-10 h-10 rounded-full ${getAvatarColor(userName)} flex items-center justify-center text-white font-semibold`}>
          {getInitials(userName)}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">{userName}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
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