/* "use client";
import { useRouter } from "next/navigation";  
import { IoClose } from "react-icons/io5";

const Login = () => {
  const router = useRouter();

  const handleClose = () => {
    // Navigate back to homepage
    router.push("/");
  };

	const Role = (e) => {
    e.preventDefault(); 
		router.push("/join/role")
	}

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
        
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div>
            <button onClick={Role}
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Continue with email
            </button>
          </div>

          <div className="relative flex items-center justify-center my-8">
            <div className="border-t border-gray-400 w-full"></div>
            <div className="absolute bg-white px-4 text-gray-500 text-sm">or</div>
          </div>

          <div className="flex flex-col gap-4 mb-10">
            <button
              type="button"
              className="w-full flex items-center gap-3 justify-center py-3 px-4 border-2 rounded-md shadow-sm text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <img src="assets/google.png" className="w-8 h-8" alt="Google logo" />
              Continue with Google
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-3 justify-center py-3 px-4 border-2 rounded-md shadow-sm text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <img src="assets/apple.png" className="w-8 h-8" alt="Apple logo" />
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

export default Login; */

"use client";
import { useRouter } from "next/navigation";  
import { IoClose } from "react-icons/io5";
import { useState } from "react";
import { useUser } from "@/app/context/UserContext";
import Image from "next/image";

const Login = () => {
  const router = useRouter();
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleClose = () => {
    router.push("/");
  };

  const handleContinueWithEmail = (e) => {
    e.preventDefault(); 
    if (email && password) {
      // Store email temporarily in localStorage or pass via route
      localStorage.setItem("tempEmail", email);
      localStorage.setItem("tempPassword", password);
      router.push("/verify-otp");
    } else {
      // Show validation error
      alert("Please enter both email and password");
    }
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
        <form className="mt-8 space-y-6" onSubmit={handleContinueWithEmail}>
          <div className="space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Continue with email
            </button>
          </div>

          <div className="relative flex items-center justify-center my-8">
            <div className="border-t border-gray-400 w-full"></div>
            <div className="absolute bg-white px-4 text-gray-500 text-sm">or</div>
          </div>

          <div className="flex flex-col gap-4 mb-10">
            <button
              type="button"
              className="relative w-full flex items-center gap-3 justify-center py-3 px-4 border-2 rounded-md shadow-sm text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Image src="/assets/google.png" width={18} height={18} alt="Google-logo" />
              Continue with Google
            </button>
            <button
              type="button"
              className="relative w-full flex items-center gap-3 justify-center py-3 px-4 border-2 rounded-md shadow-sm text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Image src="/assets/apple.png" width={18} height={18}  alt="Apple logo" />
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