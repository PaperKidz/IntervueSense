// src/components/Auth/Login.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect when already authenticated (defensive)
  useEffect(() => {
    try {
      if (authService.isAuthenticated()) {
        // If already logged in, go to maindash and replace history so back won't show login
        navigate('/maindash', { replace: true });
      }
    } catch (e) {

    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login(email, password);

      if (response && response.success) {
        // Navigate to maindash **after** token is saved by authService.login
        // use replace:true so the Login entry is replaced in history (prevents back -> login)
        navigate('/maindash', { replace: true });
      } else {
        setError(response?.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      if (err.statusCode === 401) {
        setError('Invalid email or password');
      } else if (err.statusCode === 404) {
        setError('User not found. Please sign up first.');
      } else if (err.statusCode === 0) {
        setError('Network error. Please check your internet connection.');
      } else if (err.statusCode === 408) {
        setError('Request timeout. Please try again.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Brand Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {/* decorative svg */}
        </div>

        <div className="relative z-10 flex flex-col justify-center px-20 w-full">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" strokewidth="2"></circle><path strokelinecap="round" strokelinejoin="round" stroke-width="2" d="M12 2v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M2 12h3m14 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12"></path></svg>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-wide">VirtueSense</h1>
          </div>

          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">Empowering Intelligent Experiences</h2>
          <p className="text-lg text-blue-100 leading-relaxed max-w-lg">
            Sign in to continue your journey with VirtueSense. Explore intelligent solutions, track insights, and enhance your skills through data-driven innovation.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-12">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome 👋</h2>
            <p className="text-gray-600 text-base">Log in to your VirtueSense account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  disabled={loading}
                  className="w-full pl-4 pr-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={loading}
                  className="w-full pl-4 pr-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer disabled:opacity-50"
                />
                <span className="ml-2.5 text-sm font-medium text-gray-700">Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                disabled={loading}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            <button
              type="button"
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full bg-white border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-bold py-4 rounded-xl transition-all duration-200"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
