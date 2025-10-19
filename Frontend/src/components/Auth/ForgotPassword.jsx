// src/components/Auth/ForgotPassword.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);

      if (response.success) {
        setMessage("Password reset link sent! Please check your inbox.");
      } else {
        setError(response.message || "Failed to send reset link. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-900 relative overflow-hidden">
        {/* Wavy Background */}
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
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 2v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M2 12h3m14 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-wide" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
              VirtueSense
            </h1>
          </div>

          <h2 className="text-5xl font-bold text-white mb-6 leading-tight" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
            Reset Your Password
          </h2>

          <p className="text-lg text-blue-100 leading-relaxed max-w-lg" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
            Forgot your password? Don’t worry. We’ll help you reset it and get back to your VirtueSense experience.
          </p>
        </div>
      </div>

      {/* Right Panel - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-12">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
              Forgot Password 🔒
            </h2>
            <p className="text-gray-600 text-base" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
              Enter your registered email to receive a reset link
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
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

            {/* Success / Error Message */}
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm text-center" 
                   style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center" 
                   style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              style={{fontFamily: 'Inter, system-ui, sans-serif'}}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            {/* Back to Login */}
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-white border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-bold py-4 rounded-xl transition-all duration-200"
              style={{fontFamily: 'Inter, system-ui, sans-serif'}}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
