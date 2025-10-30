import React, { useState } from 'react';
import { useProgress } from '../contexts/ProgressContext';

const DevTools = () => {
  const { progress, resetProgress, fetchProgress } = useProgress();
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetProgress();
      await fetchProgress(); // Refresh to show empty state
      alert('✅ Progress reset successfully!');
      setShowConfirm(false);
    } catch (error) {
      alert('❌ Failed to reset progress: ' + error.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 z-50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono text-green-400">🛠️ DEV TOOLS</span>
      </div>
      
      <div className="space-y-2">
        <div className="text-xs text-gray-400">
          Progress Items: <span className="text-white font-semibold">{progress.length}</span>
        </div>
        
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
            disabled={progress.length === 0}
          >
            🗑️ Reset Progress
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-yellow-400">⚠️ Are you sure?</p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors disabled:opacity-50"
              >
                {isResetting ? '⏳ Resetting...' : '✓ Yes'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isResetting}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors disabled:opacity-50"
              >
                ✗ Cancel
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={fetchProgress}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
        >
          🔄 Refresh Progress
        </button>
      </div>
      
      {progress.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">
            View Progress Data
          </summary>
          <pre className="mt-2 text-xs bg-gray-800 p-2 rounded overflow-auto max-h-40 text-gray-300">
            {JSON.stringify(progress, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default DevTools;