"use client";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="bg-gray-900 py-8 px-4 md:px-6 lg:px-20">
      {/* Main content container */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 pb-8 lg:pb-10 justify-center">
        {/* Logo and description */}
        <div className="flex flex-col gap-4 lg:w-[400px]">
          <div className="flex gap-4 items-center">
            <img src="/assets/logo.png" className="h-16 w-16 lg:h-20 lg:w-20" alt="Home Buddy Logo" />
            <h1 className="font-bold text-white text-2xl lg:text-4xl">Home Buddy</h1>
          </div>
          <p className="text-white text-sm lg:text-base">
            Home Buddy is a trusted real estate platform that helps you buy, rent or 
            sell verified properties with confidence. From affordable apartment to premium
            lands business spaces, we connect you with trusted agents, verified listings and 
            seamless property management tools, all in one place.
          </p>
          <div className="flex gap-3">
            {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaWhatsapp].map((Icon, index) => (
              <div 
                key={index}
                className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-800 flex items-center justify-center rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <Icon className="text-white text-lg lg:text-xl" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Links sections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:flex lg:gap-20 lg:pt-8">
          {/* Services */}
          <div className="flex flex-col gap-2">
            <p className="text-lg lg:text-2xl text-white uppercase font-semibold">Services</p>
            <div className="flex flex-col gap-2">
              <Link href="/buy" className="text-white hover:text-blue-400 transition-colors text-sm lg:text-base">Buy</Link>
              <Link href="/rent" className="text-white hover:text-blue-400 transition-colors text-sm lg:text-base">Rent</Link>
              <Link href="/sell" className="text-white hover:text-blue-400 transition-colors text-sm lg:text-base">Sell</Link>
              <Link href="/agents" className="text-white hover:text-blue-400 transition-colors text-sm lg:text-base">Agents</Link>
              <Link href="/facility-mgt" className="text-white hover:text-blue-400 transition-colors text-sm lg:text-base">Facility Management</Link>
            </div>
          </div>
          
          {/* Quick links */}
          <div className="flex flex-col gap-2">
            <p className="text-lg lg:text-2xl text-white uppercase font-semibold">Quick links</p>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-white hover:text-blue-400 transition-colors text-sm lg:text-base">Home</Link>
              <Link href="/contact" className="text-white hover:text-blue-400 transition-colors text-sm lg:text-base">Contact</Link>
              <Link href="/about" className="text-white hover:text-blue-400 transition-colors text-sm lg:text-base">About</Link>
            </div>
          </div>
          
          {/* Support */}
          <div className="flex flex-col gap-2">
            <p className="text-lg lg:text-2xl text-white uppercase font-semibold">Support</p>
            <div className="flex flex-col gap-2">
              <Link href="/help-center" className="text-white hover:text-blue-400 transition-colors text-sm lg:text-base">Help Center</Link>
              <Link href="/faqs" className="text-white hover:text-blue-400 transition-colors text-sm lg:text-base">FAQs</Link>
              <Link href="/terms" className="text-white hover:text-blue-400 transition-colors text-sm lg:text-base">Terms & Conditions</Link>
              <Link href="/privacy" className="text-white hover:text-blue-400 transition-colors text-sm lg:text-base">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="text-center pt-4 border-gray-700">
        <p className="text-sm lg:text-md text-gray-300">&copy;2025 Home Buddy. All rights reserved</p>
      </div>
    </div>
  )
}

export default Footer