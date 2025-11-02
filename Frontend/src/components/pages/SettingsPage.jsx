import { useState, useEffect } from 'react';
import { User, Mail, Calendar } from 'lucide-react';
import authService from '../../services/auth.service';
import Layout from '../shared/Layout';

export default function SettingsPage() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    joinDate: '',
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserData({
        name: user.name || user.username || 'User',
        email: user.email || '',
        joinDate: user.createdAt || 'N/A',
      });
    }
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
            <div className="flex items-center gap-6 mb-8">
              <div className={`w-24 h-24 rounded-full ${getAvatarColor(userData.name)} flex items-center justify-center text-white text-2xl font-bold`}>
                {getInitials(userData.name)}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{userData.name}</h2>
                <p className="text-gray-500">{userData.email}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Avatar upload coming in Phase 2
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData.name}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Editing disabled for Phase 1</p>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              {/* Join Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} />
                  Member Since
                </label>
                <input
                  type="text"
                  value={userData.joinDate}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">🚀 Coming in Phase 2</h3>
            <ul className="space-y-2 text-sm text-indigo-700">
              <li>• Edit profile information</li>
              <li>• Upload custom avatar</li>
              <li>• Change password</li>
              <li>• Email notification preferences</li>
              <li>• Account deletion option</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}