import { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, Lock, Trash2, Save, X, AlertCircle, CheckCircle, Camera, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import userService from '../../services/user.service';
import Layout from '../shared/Layout';
import API_CONFIG from '../../config/api.config';

export default function SettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    joinDate: '',
    avatar: null,
  });

  // Edit mode states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  
  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Delete account states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Loading and message states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUserData();
  }, []);

  // Load user data from localStorage
  const loadUserData = () => {
    const user = authService.getCurrentUser();
    if (user) {
      const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
      setUserData({
        name: user.name || user.username || 'User',
        email: user.email || '',
        joinDate: joinDate,
        avatar: user.avatar || null,
      });
      setEditedName(user.name || user.username || '');
      setAvatarPreview(user.avatar ? `${API_CONFIG.BASE_URL}${user.avatar}` : null);
    }
  };

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

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', 'Only image files (JPEG, PNG, GIF, WebP) are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 5MB');
      return;
    }

    // Upload avatar
    handleAvatarUpload(file);
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file) => {
    setIsUploadingAvatar(true);
    try {
      const response = await userService.uploadAvatar(file);
      
      // Service already updated localStorage, just refresh the UI
      loadUserData();
      
      // Notify other components (like navbar) to update
      window.dispatchEvent(new Event('profileUpdate'));
      
      showMessage('success', 'Avatar uploaded successfully');
    } catch (error) {
      showMessage('error', error.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle avatar deletion
  const handleDeleteAvatar = async () => {
    if (!userData.avatar) return;

    setIsUploadingAvatar(true);
    try {
      await userService.deleteAvatar();
      
      // Service already updated localStorage, just refresh the UI
      loadUserData();
      
      // Notify other components (like navbar) to update
      window.dispatchEvent(new Event('profileUpdate'));
      
      showMessage('success', 'Avatar deleted successfully');
    } catch (error) {
      showMessage('error', error.message || 'Failed to delete avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle name update
  const handleNameUpdate = async () => {
    if (!editedName.trim() || editedName.trim().length < 2) {
      showMessage('error', 'Name must be at least 2 characters');
      return;
    }

    if (editedName.trim() === userData.name) {
      setIsEditingName(false);
      return;
    }

    setLoading(true);
    try {
      await userService.updateProfile(editedName.trim());
      
      // Service already updated localStorage, just refresh the UI
      loadUserData();
      
      // Notify other components (like navbar) to update
      window.dispatchEvent(new Event('profileUpdate'));
      
      setIsEditingName(false);
      showMessage('success', 'Name updated successfully');
    } catch (error) {
      showMessage('error', error.message || 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showMessage('error', 'All password fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      showMessage('success', 'Password changed successfully');
    } catch (error) {
      showMessage('error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showMessage('error', 'Password is required');
      return;
    }

    setLoading(true);
    try {
      await userService.deleteAccount(deletePassword);
      showMessage('success', 'Account deleted successfully');
      setTimeout(() => {
        navigate('/signup');
      }, 1500);
    } catch (error) {
      showMessage('error', error.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

          {/* Success/Error Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
            <div className="flex items-start gap-6 mb-8">
              {/* Avatar Section */}
              <div className="relative group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={userData.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-full ${getAvatarColor(userData.name)} flex items-center justify-center text-white text-2xl font-bold`}>
                    {getInitials(userData.name)}
                  </div>
                )}
                
                {/* Avatar Upload/Delete Buttons */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="text-white hover:text-indigo-300 transition-colors"
                    title="Upload avatar"
                  >
                    {isUploadingAvatar ? (
                      <div className="animate-spin">
                        <Upload size={24} />
                      </div>
                    ) : (
                      <Camera size={24} />
                    )}
                  </button>
                </div>

                {/* Delete Avatar Button (only if avatar exists) */}
                {userData.avatar && (
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={isUploadingAvatar}
                    className="absolute -bottom-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Delete avatar"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900">{userData.name}</h2>
                <p className="text-gray-500">{userData.email}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Click on avatar to upload. Max 5MB. Supports JPEG, PNG, GIF, WebP
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Name - Editable */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  Full Name
                </label>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                    <button
                      onClick={handleNameUpdate}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save size={16} /> Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setEditedName(userData.name);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userData.name}
                      disabled
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Email - Read only */}
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

          {/* Change Password Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Lock size={20} />
                Change Password
              </h3>
              {!showPasswordChange && (
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Change Password
                </button>
              )}
            </div>

            {showPasswordChange && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Delete Account Section */}
          <div className="bg-red-50 rounded-lg border border-red-200 p-8">
            <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center gap-2">
              <Trash2 size={20} />
              Delete Account
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete My Account
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-red-900 mb-2">
                    Enter your password to confirm deletion
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}