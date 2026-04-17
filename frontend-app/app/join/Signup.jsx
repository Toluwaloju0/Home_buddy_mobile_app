"use client";

import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { useState } from "react";
import { authAPI } from "@/lib/api";

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("buyer");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !firstName || !lastName || !role || !password || !confirmPassword || !phoneNumber) {
      setError("Please fill in all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password must match");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
        phone_number: phoneNumber,
      };

      const response = await authAPI.signup(payload);

      if (response.status) {
        // Store email for OTP page
        if (response.payload && response.payload.email) {
          localStorage.setItem("tempEmail", response.payload.email);
        } else {
          localStorage.setItem("tempEmail", email);
        }

        // Navigate to OTP verification
        router.push("/verify-otp");
      } else {
        setError(response.message || "Failed to create account. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition duration-200"
            aria-label="Close"
          >
            <IoClose className="text-2xl text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100"
              />
            </div>

            <div className="flex gap-3">
              <div className="w-1/2">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  disabled={loading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100"
                />
              </div>
              <div className="w-1/2">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                  disabled={loading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            <div>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number"
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100"
              />
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100"
              />
            </div>

            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/join")}
              className="w-full inline-flex justify-center items-center py-3 px-4 border-2 border-primary rounded-md text-sm font-semibold text-primary bg-white hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Already have an account? Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
