import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Brand Side with Blue Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-900 relative overflow-hidden">
        {/* Wavy pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="wave" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0 50 Q 25 30, 50 50 T 100 50" stroke="white" strokeWidth="1" fill="none" opacity="0.5"/>
                <path d="M0 60 Q 25 40, 50 60 T 100 60" stroke="white" strokeWidth="1" fill="none" opacity="0.4"/>
                <path d="M0 70 Q 25 50, 50 70 T 100 70" stroke="white" strokeWidth="1" fill="none" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wave)"/>
          </svg>
        </div>

        {/* Brand Content */}
        <div className="relative z-10 flex flex-col justify-center px-20 w-full">
          {/* Logo and Company Name */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M2 12h3m14 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-wide" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
              VirtueSense
            </h1>
          </div>

          {/* Tagline */}
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
            Empowering Intelligent Experiences
          </h2>

          {/* Description */}
          <p className="text-lg text-blue-100 leading-relaxed max-w-lg" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
            Sign in to continue your journey with VirtueSense. Explore intelligent solutions, track insights, and enhance your skills through data-driven innovation.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-12">
          {/* Welcome Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
              Welcome 👋
            </h2>
            <p className="text-gray-600 text-base" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
              Log in to your VirtueSense account
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                  style={{fontFamily: 'Inter, system-ui, sans-serif'}}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                  style={{fontFamily: 'Inter, system-ui, sans-serif'}}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span className="ml-2.5 text-sm font-medium text-gray-700" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                  Remember Me
                </span>
              </label>
              <button
                type="button"
                onClick={() => alert('Forgot password functionality')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                style={{fontFamily: 'Inter, system-ui, sans-serif'}}
              >
                Forgot Password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{fontFamily: 'Inter, system-ui, sans-serif'}}
            >
              Login
            </button>

            {/* Create Account Button */}
            <button
              onClick={handleCreateAccount}
              className="w-full bg-white border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-bold py-4 rounded-xl transition-all duration-200"
              style={{fontFamily: 'Inter, system-ui, sans-serif'}}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}