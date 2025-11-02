import { Home, BookOpen, Settings, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProgress } from '../../contexts/ProgressContext';

export default function SideNav({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { progress } = useProgress();

  // Calculate overall progress
  const getOverallProgress = () => {
    if (!progress || progress.length === 0) return 0;
    const completedItems = progress.filter(item => item.status === 'completed').length;
    return Math.round((completedItems / progress.length) * 100);
  };

  const overallProgress = getOverallProgress();

  const navItems = [
    { path: '/Home', label: 'Home', icon: Home },
    { path: '/maindash', label: 'Modules', icon: BookOpen },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    onClose(); // Close side nav after navigation
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Side Navigation */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Welcome Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-gray-900">👋 Welcome back!</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-semibold text-indigo-600">{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                      transition-colors duration-200
                      ${
                        active
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">VirtueSense v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}