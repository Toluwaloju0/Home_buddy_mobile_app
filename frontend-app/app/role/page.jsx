"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import { LuHouse } from "react-icons/lu";
import { IoKeyOutline } from "react-icons/io5";

const RolePage = () => {
  const router = useRouter();
  const { login } = useUser();
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("tempEmail");
    const storedPassword = localStorage.getItem("tempPassword");
    if (storedEmail && storedPassword) {
      setEmail(storedEmail);
    }
  }, []);

  const handleContinue = () => {
    if (selectedRole && email) {
      // Create user object
      const userData = {
        email: email,
        role: selectedRole,
        name: email.split('@')[0], // Use part of email as name
        avatar: selectedRole === 'agent' ? 'assets/agent-1.png' : 'assets/user-default.png'
      };
      
      // Login user
      login(userData);
      
      // Clean up temp storage
      localStorage.removeItem("tempEmail");
      
      // Navigate to homepage
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-[700px] w-full p-8 bg-white rounded-lg shadow">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Who are you?
            </h2>
            <p className="text-gray-600 text-md">
              Choose how you want to use Home Buddy. This helps us personalize your experience
            </p>
          </div>

          {email && (
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-600">Signed in as: <span className="font-semibold">{email}</span></p>
            </div>
          )}

          <div className="space-y-6">
            {/* Option 1 */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedRole === 'agent' 
                  ? 'border-primary' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setSelectedRole('agent')}
            >
              <div className="flex items-center gap-4">
                <LuHouse className="text-xl w-30 h-30 text-gray-500"/>
                <div>
                  <h3 className="font-semibold text-lg mb-1">I'm an Agent/Landlord</h3>
                  <p className="text-gray-500 text-sm mb-1">
                    List apartments, shops, and lands for sale or rent.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Manage inquiries and track performance.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2 */}
            <div 
              className={`p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedRole === 'buyer' 
                  ? 'border-primary' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setSelectedRole('buyer')}
            >
              <div className="flex items-center gap-4">
                <IoKeyOutline className="text-xl w-30 h-30 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">I'm a Buyer/Renter</h3>
                  <p className="text-gray-500 text-sm mb-1">
                    Explore properties to buy or rent.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Save favorites, chat with agents, and schedule inspections.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`w-full py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 ${
              selectedRole 
                ? 'bg-primary hover:bg-primary/90 cursor-pointer' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Continue as {selectedRole === 'agent' ? 'Agent' : 'Buyer/Renter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolePage;