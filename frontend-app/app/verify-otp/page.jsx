"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/navigation";

const VerifyOTP = () => {
	const router = useRouter();
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [email] = useState(localStorage.getItem("tempEmail"));
	const [status, setStatus] = useState("pending"); // pending, error, expired, success
	

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
	
	const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    
    // Simulate different states based on entered OTP (a test run)
    if (enteredOtp === "000010") {
      setStatus("error");
    } else if (enteredOtp === "000000") {
      setStatus("expired");
    } else if (enteredOtp === "000001") {
      setStatus("success");
      // Once this is properly integrated, it will navigate to the dashboard
      setTimeout(() => {
        router.push("/role");
      }, 1000);
    } else {
      setStatus("error");
    }
  };

	const getStatuseMessage = () => {
		switch(status) {
			case "error":
				return "Incorrect code. Please try again.";
			case "expired":
				return "This code has expired. Please request a new one";
			case "success":
				return "Verification successfull";
			default:
				return "";
		}
	};
	



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="flex flex-col gap-6 border-2 max-w-[600px] w-full p-8 bg-white rounded-lg shadow">
				<div className="w-full flex justify-center">
					<div className="w-40 h-40 relative">
						<Image src="/assets/logo.png" alt="image" fill />
					</div>	
				</div>
				
				<div>
					<div className="mb-4">
						<h1 className="font-bold text-3xl mb-2">Verify your account</h1>
						<p className="text-gray-400">Please send the 6 digit code we sent to your email</p>
					</div>
						{/* OTP input */}
					<form className=" " onSubmit={handleSubmit}>
						<div className="flex justify-center gap-4">
							{otp.map((digit, index) =>{
								return (
									<input
									key={index}
									id={`otp-${index}`}
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									maxLength="1"
									value={digit}
									onChange={(e) => handleOtpChange(index, e.target.value)}
									onKeyDown={(e) => handleKeyDown(index, e)}
									className={`w-16 h-16 text-3xl text-center border-2 rounded-md focus:outline-none focus:border-primary ${
										status === "error" ? "border-red-500" : 
										status === "success" ? "border-green-500" : "border-gray-300"
									}`} 
								/>
								)	
							})}
						</div>

						{/* status Message */}
						<div className="flex justify-start pl-8">
							{status != "pending" && (
							<p className={` font-medium ${
								status === "error" ? "text-red-600" : 
								status === "expired" ? "text-yellow-600" : "text-green-600"}`}>
								{getStatuseMessage()}
							</p>
							)}
						</div>
							

						<div className="text-center my-6">
							<p className="text-gray-600">
								Haven't received the code yet?{" "}
								<button
									type="button"
									className="text-primary font-semibold hover:underline"
									onClick={() => {
										// Logic to resend code
										setOtp(["", "", "", "", "", ""]);
										setStatus("pending");
									}}
								>
									Tap here to resend in 60s
								</button>
							</p>
						</div>

						{/* continue button */}
						<Button type="submit" className="w-full py-6 text-white font-semibold rounded-lg hover:bg-primary/90 transition duration-200">
							Continue
						</Button>

						{/* Back link */}
						<div className="my-1">
							<button type="button" onClick={() => router.back()} className="w-full py-1 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition duration-200">
								<IoMdArrowRoundBack />
								<span>Go back</span>
							</button>
						</div>		
					</form>
				</div>	
			</div>
			
    </div>
  )
}

export default VerifyOTP