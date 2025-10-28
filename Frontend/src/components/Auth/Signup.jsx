// src/components/Auth/Signup.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔒 Auto-redirect if user already logged in
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      navigate("/maindash", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ✅ Basic validations
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await authService.signup(name, email, password);

      if (response.success) {
        // ✅ Store user and redirect directly to dashboard
        navigate("/maindash", { replace: true });
      } else {
        setError(response.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      // ✅ Detailed error handling
      if (error.statusCode === 409) {
        setError("Email already exists. Please login instead.");
      } else if (error.statusCode === 400) {
        setError(error.message || "Invalid input. Please check your details.");
      } else if (error.statusCode === 0) {
        setError("Network error. Please check your internet connection.");
      } else if (error.statusCode === 408) {
        setError("Request timeout. Please try again.");
      } else {
        setError(error.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
            Join VirtueSense today and unlock intelligent solutions. Track insights, enhance your skills, and accelerate your growth through data-driven innovation.
          </p>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-12">
          {/* Welcome Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
              Create Account 🚀
            </h2>
            <p className="text-gray-600 text-base" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
              Join VirtueSense and start your journey
            </p>
          </div>

          {/* Signup Form */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{fontFamily: 'Inter, system-ui, sans-serif'}}
                />
              </div>
            </div>

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
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  placeholder="Create a strong password"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{fontFamily: 'Inter, system-ui, sans-serif'}}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                {error}
              </div>
            )}

            {/* Sign Up Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              style={{fontFamily: 'Inter, system-ui, sans-serif'}}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>

            {/* Already Have Account */}
            <div className="text-center pt-2">
              <span className="text-gray-600 text-sm" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                Already have an account?{' '}
              </span>
              <button
                onClick={() => navigate('/login')}
                disabled={loading}
                className="text-blue-700 font-semibold text-sm hover:text-blue-800 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{fontFamily: 'Inter, system-ui, sans-serif'}}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}