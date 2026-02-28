"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

const VerifyOTP = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("pending"); // pending, error, expired, success
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("tempEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email, redirect to login
      router.push("/join");
    }

    // Start resend timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    // Validate OTP length
    if (enteredOtp.length !== 6) {
      setStatus("error");
      setErrorMessage("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setStatus("pending");
    setErrorMessage("");

    try {
      // Call backend API to verify OTP
      const response = await authAPI.verifyOTP(enteredOtp);

      if (response.status) {
        setStatus("success");
        setErrorMessage("");
        
        // Navigate based on next_url in response
        setTimeout(() => {
          if (response.next_url === "/select/roles") {
            router.push("/role");
          } else {
            router.push("/");
          }
        }, 1000);
      } else {
        setStatus("error");
        setErrorMessage(response.message || "Invalid OTP code. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await authAPI.resendOTP();

      if (response.status) {
        // Reset OTP inputs
        setOtp(["", "", "", "", "", ""]);
        setStatus("pending");
        
        // Reset timer
        setCanResend(false);
        setResendTimer(60);
        
        // Restart timer
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        alert("New OTP code sent to your email!");
      } else {
        setErrorMessage(response.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setErrorMessage(error.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (errorMessage) return errorMessage;
    
    switch (status) {
      case "success":
        return "Verification successful!";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col gap-6 border-2 max-w-[600px] w-full p-8 bg-white rounded-lg shadow">
        <div className="w-full flex justify-center">
          <div className="w-40 h-40 relative">
            <Image src="/assets/logo.png" alt="Home Buddy Logo" fill />
          </div>
        </div>

        <div>
          <div className="mb-4">
            <h1 className="font-bold text-3xl mb-2">Verify your account</h1>
            <p className="text-gray-400">
              Please enter the 6 digit code we sent to{" "}
              <span className="font-semibold text-gray-600">{email}</span>
            </p>
          </div>

          {/* OTP input */}
          <form className=" " onSubmit={handleSubmit}>
            <div className="flex justify-center gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="text"
                  pattern="[A-Za-z0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className={`w-16 h-16 text-3xl text-center border-2 rounded-md focus:outline-none focus:border-primary disabled:bg-gray-100 ${
                    status === "error"
                      ? "border-red-500"
                      : status === "success"
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Status Message */}
            <div className="flex justify-center mt-4 min-h-[24px]">
              {status !== "pending" && (
                <p
                  className={`font-medium ${
                    status === "error"
                      ? "text-red-600"
                      : status === "success"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {getStatusMessage()}
                </p>
              )}
            </div>

            <div className="text-center my-6">
              <p className="text-gray-600">
                Haven't received the code yet?{" "}
                <button
                  type="button"
                  className={`font-semibold ${
                    canResend
                      ? "text-primary hover:underline cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handleResendOTP}
                  disabled={!canResend || loading}
                >
                  {canResend
                    ? "Tap here to resend"
                    : `Resend in ${resendTimer}s`}
                </button>
              </p>
            </div>

            {/* Continue button */}
            <Button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full py-6 text-white font-semibold rounded-lg hover:bg-primary/90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Continue"}
            </Button>

            {/* Back link */}
            <div className="my-1">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="w-full py-1 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition duration-200 disabled:opacity-50"
              >
                <IoMdArrowRoundBack />
                <span>Go back</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;