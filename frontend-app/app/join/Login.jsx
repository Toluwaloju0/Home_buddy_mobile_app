"use client";
import { useRouter } from "next/navigation";  
import { IoClose } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import { authAPI } from "@/lib/api";
import Image from "next/image";

const Login = () => {
  const router = useRouter();
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const handleClose = () => {
    router.push("/");
  };

  // Handle email login - Send OTP
  const handleContinueWithEmail = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending OTP to:", email);
      const response = await authAPI.login(email);
      
      console.log("Login response:", response);

      if (response.status) {
        // Store email for OTP page
        localStorage.setItem("tempEmail", email);
        
        // Navigate to OTP verification
        router.push("/verify-otp");
      } else {
        setError(response.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In response
  const handleGoogleResponse = async (response) => {
    console.log("Google credential received");
    setLoading(true);
    setError("");

    try {
      // Send credential to backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          credential: response.credential
        })
      });

      const data = await res.json();
      console.log("Backend response:", data);
      
      if (data.status) {
        // Store Google email for OTP page
        if (data.payload && data.payload.email) {
          localStorage.setItem("tempEmail", data.payload.email);
        }
        
        // Backend will send OTP and return /otp/verify as next_url
        if (data.next_url === "/otp/verify") {
          // Show success message
          console.log("OTP sent to Google email, redirecting to verification...");
          router.push("/verify-otp");
        } else {
          // Fallback navigation
          router.push(data.next_url || "/verify-otp");
        }
      } else {
        setError(data.message || "Google sign-in failed");
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Sign-In
  useEffect(() => {
    // Load Google Script
    const loadGoogleScript = () => {
      if (document.getElementById('google-signin-script')) {
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-signin-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google script loaded');
        setGoogleLoaded(true);
        
        // Initialize Google Sign-In
        if (window.google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          
          console.log('Google Sign-In initialized');
        }
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Sign-In script');
        setError('Failed to load Google Sign-In');
      };

      document.body.appendChild(script);
    };

    loadGoogleScript();

    // Cleanup
    return () => {
      const script = document.getElementById('google-signin-script');
      if (script) {
        script.remove();
      }
    };
  }, []);

  // Handle Google button click
  const handleGoogleClick = () => {
    if (!googleLoaded || !window.google) {
      setError('Google Sign-In is still loading. Please wait...');
      return;
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured');
      return;
    }

    // Trigger Google One Tap
    window.google.accounts.id.prompt((notification) => {
      console.log('Google prompt notification:', notification);
      
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('One Tap not available');
        setError('Please enable third-party cookies or try email login');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join or Sign In
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
            aria-label="Close"
          >
            <IoClose className="text-2xl text-gray-600" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleContinueWithEmail}>
          <div className="space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending code..." : "Continue with email"}
            </button>
          </div>

          <div className="relative flex items-center justify-center my-8">
            <div className="border-t border-gray-400 w-full"></div>
            <div className="absolute bg-white px-4 text-gray-500 text-sm">or</div>
          </div>

          <div className="flex flex-col gap-4 mb-10">
            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={loading || !googleLoaded}
              className="relative w-full flex items-center gap-3 justify-center py-3 px-4 border-2 rounded-md shadow-sm text-sm font-bold text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Image src="/assets/google.png" width={18} height={18} alt="Google-logo" />
              {googleLoaded ? 'Continue with Google' : 'Loading Google Sign-In...'}
            </button>

            {/* Apple Sign-In Button (placeholder) */}
            <button
              type="button"
              disabled={true}
              className="relative w-full flex items-center gap-3 justify-center py-3 px-4 border-2 rounded-md shadow-sm text-sm font-bold text-gray-400 cursor-not-allowed transition-colors"
              title="Coming soon"
            >
              <Image src="/assets/apple.png" width={18} height={18} alt="Apple logo" />
              Continue with Apple
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm [word-spacing:0.1em]">
              By signing in you agree to Home Buddy{" "}
              <span className="text-black font-semibold">Terms of Use</span> and{" "}
              <span className="text-black font-semibold">Privacy Policy</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
