import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// TODO: Replace this with your actual backend endpoint
const API_URL = 'http://localhost:8800/api/auth/login'; 

const LoginPage = () => {
  const navigate = useNavigate();
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload
    setErrorMessage(''); // Clear previous errors
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Check the status as per your requirement
      if (data.status === true) {
        // Handle redirection
        // If next_action is an absolute URL (http...), use window.location
        // If it's a relative path (/dashboard...), use navigate
        if (data.next_action.startsWith('http')) {
          window.location.href = data.next_action;
        } else {
          navigate(data.next_action);
        }
      } else {
        // Display the message returned from the backend
        setErrorMessage(data.message || 'Login failed. Please try again.');
      }

    } catch (error) {
      console.error('Login Error:', error);
      setErrorMessage('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/90 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-[480px] p-8 relative shadow-2xl">
        
        {/* Close Button */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-8">Join or Sign in</h2>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
             <span className="mr-2">⚠️</span> {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-gray-400 focus:ring-0 text-gray-700 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-gray-400 focus:ring-0 text-gray-700 transition-all pr-12"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {/* Main Action Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-dark text-white font-medium py-3.5 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Signing in...
              </>
            ) : (
              'Continue with email'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">or</span>
          </div>
        </div>

        {/* Social Buttons (Stateless for now) */}
        <div className="space-y-3">
          <button type="button" className="w-full border border-gray-200 text-gray-700 font-medium py-3.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button type="button" className="w-full border border-gray-200 text-gray-700 font-medium py-3.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 384 512">
               <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Footer Terms */}
        <p className="text-center text-[10px] text-gray-500 mt-6 leading-tight max-w-xs mx-auto">
          By signing in you agree to Home Buddy <span className="font-bold text-gray-700 cursor-pointer">Terms of Use</span> and <span className="font-bold text-gray-700 cursor-pointer">Privacy Policy</span>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;