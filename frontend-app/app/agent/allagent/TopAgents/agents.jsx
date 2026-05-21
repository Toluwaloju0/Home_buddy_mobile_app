"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaStar } from "react-icons/fa";
import { FaRegMessage } from "react-icons/fa6";
import { IoCallOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import { useState, useEffect } from "react";

const agents = [
  {
    image: "/assets/agent-1.png",
    name: "Chika Nwosu",
    company: "Greenfield Reality",
    rating: "4.8",
    reviews: "120",
    listed: "42",
    sold: "31",
    rent: "2",
  },
  {
    image: "/assets/agent-2.png",
    name: "Kunle Adebayo",
    company: "PrimeWEdge Properties",
    rating: "4.7",
    reviews: "94",
    listed: "37",
    sold: "25",
    rent:"",
  },
  {
    image: "/assets/agent-3.png",
    name: "Sarah Johnson",
    company: "LandLink Ltd.",
    rating: "4.8",
    reviews: "77",
    listed: "60",
    sold: "48",
    rent:"",
  },
  {
    image: "/assets/agent-5.png",
    name: "Jane Doe",
    company: "LandLink Ltd.",
    rating: "4.7",
    reviews: "128",
    listed: "42",
    sold: "25",
    rent: "2",
  },
  {
    image: "/assets/agent-4.png",
    name: "Kunle Babalola",
    company: "Greenfield Realty",
    rating: "4.5",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent:"2",
  },
  {
    image: "/assets/agent-6.png",
    name: "Duke Johnson",
    company: "PrimeWEdge Properties",
    rating: "4.5",
    reviews: "77",
    listed: "60",
    sold: "48",
    rent:"3",
  },
  {
    image: "/assets/agent-8.png",
    name: "Sarah Martin",
    company: "PrimeWEdge Properties",
    rating: "4.8",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent: "",
  },
  {
    image: "/assets/agent-9.png",
    name: "Kunle Adebayo",
    company: "Greenfield Reality",
    rating: "4.7",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent:"2",
  },
  {
    image: "/assets/agent-10.png",
    name: "Sarah Johnson",
    company: "LandLink Ltd.",
    rating: "4.8",
    reviews: "77",
    listed: "60",
    sold: "48",
    rent:"",
  },
  {
    image: "/assets/agent-11.jpg",
    name: "Kunle Adebayo",
    company: "PrimeWEdge Properties",
    rating: "4.8",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent: "",
  },
  {
    image: "/assets/agent-12.png",
    name: "Chka Nwosu",
    company: "Greenfield Reality",
    rating: "4.9",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent:"2",
  },
  {
    image: "/assets/agent-13.png",
    name: "Sarah Johnson",
    company: "LandLink Ltd.",
    rating: "4.8",
    reviews: "77",
    listed: "60",
    sold: "48",
    rent:"",
  },
	{
    image: "/assets/agent-10.png",
    name: "Sarah Johnson",
    company: "LandLink Ltd.",
    rating: "4.8",
    reviews: "77",
    listed: "60",
    sold: "48",
    rent:"",
  },
  {
    image: "/assets/agent-11.jpg",
    name: "Kunle Adebayo",
    company: "PrimeWEdge Properties",
    rating: "4.8",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent: "",
  },
  {
    image: "/assets/agent-12.png",
    name: "Chka Nwosu",
    company: "Greenfield Reality",
    rating: "4.9",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent:"2",
  },
  {
    image: "/assets/agent-13.png",
    name: "Sarah Johnson",
    company: "LandLink Ltd.",
    rating: "4.8",
    reviews: "77",
    listed: "60",
    sold: "48",
    rent:"",
  },
	{
    image: "/assets/agent-1.png",
    name: "Chika Nwosu",
    company: "Greenfield Reality",
    rating: "4.8",
    reviews: "120",
    listed: "42",
    sold: "31",
    rent: "2",
  },
  {
    image: "/assets/agent-2.png",
    name: "Kunle Adebayo",
    company: "PrimeWEdge Properties",
    rating: "4.7",
    reviews: "94",
    listed: "37",
    sold: "25",
    rent:"",
  },
  {
    image: "/assets/agent-3.png",
    name: "Sarah Johnson",
    company: "LandLink Ltd.",
    rating: "4.8",
    reviews: "77",
    listed: "60",
    sold: "48",
    rent:"",
  },
  {
    image: "/assets/agent-5.png",
    name: "Jane Doe",
    company: "LandLink Ltd.",
    rating: "4.7",
    reviews: "128",
    listed: "42",
    sold: "25",
    rent: "2",
  },
  {
    image: "/assets/agent-4.png",
    name: "Kunle Babalola",
    company: "Greenfield Realty",
    rating: "4.5",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent:"2",
  },
  {
    image: "/assets/agent-6.png",
    name: "Duke Johnson",
    company: "PrimeWEdge Properties",
    rating: "4.5",
    reviews: "77",
    listed: "60",
    sold: "48",
    rent:"3",
  },
  {
    image: "/assets/agent-8.png",
    name: "Sarah Martin",
    company: "PrimeWEdge Properties",
    rating: "4.8",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent: "",
  },
  {
    image: "/assets/agent-9.png",
    name: "Kunle Adebayo",
    company: "Greenfield Reality",
    rating: "4.7",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent:"2",
  },
  {
    image: "/assets/agent-10.png",
    name: "Sarah Johnson",
    company: "LandLink Ltd.",
    rating: "4.8",
    reviews: "77",
    listed: "60",
    sold: "48",
    rent:"",
  },
  {
    image: "/assets/agent-11.jpg",
    name: "Kunle Adebayo",
    company: "PrimeWEdge Properties",
    rating: "4.8",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent: "",
  },
  {
    image: "/assets/agent-12.png",
    name: "Chka Nwosu",
    company: "Greenfield Reality",
    rating: "4.9",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent:"2",
  },
  {
    image: "/assets/agent-13.png",
    name: "Sarah Johnson",
    company: "LandLink Ltd.",
    rating: "4.8",
    reviews: "77",
    listed: "60",
    sold: "48",
    rent:"",
  },
	{
    image: "/assets/agent-10.png",
    name: "Sarah Johnson",
    company: "LandLink Ltd.",
    rating: "4.8",
    reviews: "77",
    listed: "60",
    sold: "48",
    rent:"",
  },
  {
    image: "/assets/agent-11.jpg",
    name: "Kunle Adebayo",
    company: "PrimeWEdge Properties",
    rating: "4.8",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent: "",
  },
  {
    image: "/assets/agent-12.png",
    name: "Chka Nwosu",
    company: "Greenfield Reality",
    rating: "4.9",
    reviews: "128",
    listed: "42",
    sold: "31",
    rent:"2",
  },
  {
    image: "/assets/agent-13.png",
    name: "Sarah Johnson",
    company: "LandLink Ltd.",
    rating: "4.8",
    reviews: "77",
    listed: "60",
    sold: "48",
    rent:"",
  },
];

const Agents = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const agentsPerPage = 10;
  const totalPages = Math.ceil(agents.length / agentsPerPage);
  
  // Calculate the agents to display on the current page
  const indexOfLastAgent = currentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
  const currentAgents = agents.slice(indexOfFirstAgent, indexOfLastAgent);
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Show ellipsis after first page if needed
    if (currentPage > 3) {
      pageNumbers.push("...");
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }
    
    // Show ellipsis before last page if needed
    if (currentPage < totalPages - 2) {
      if (!pageNumbers.includes("...")) {
        pageNumbers.push("...");
      }
    }
    
    // Always show last page if there's more than 1 page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-10 pb-10">
        {currentAgents.map((agent, index) => (
          <div 
            key={index} 
            className="flex flex-col border border-gray-300 rounded-xl p-4 w-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex flex-col sm:flex-row mb-8 p-4 border rounded-md border-gray-200">
              <div className="flex justify-center sm:justify-start mb-4 sm:mb-0 sm:mr-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28">
                  <img 
                    src={agent.image} 
                    alt={agent.name}
                    className="w-full h-full object-cover rounded-full border-4 border-white shadow-md" 
                  />
                </div>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
                  {agent.name} 
                  <span><MdVerified className="text-sm text-green-700"/></span>
                </h3>
                <p className="text-gray-500 text-sm sm:text-base mb-1">{agent.company}</p>
                
                <div className="flex justify-center sm:justify-start items-center gap-2">
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                    <p className="text-gray-800 text-sm">{agent.rating}</p>
                    <FaStar className="text-yellow-400 text-sm" />
                  </div>
                  <p className="text-gray-600 text-sm font-bold">{agent.reviews} Reviews</p>
                </div>
                
                <div className="bg-gray-50 px-2 py-1 rounded-lg mt-1">
                  <p className="text-gray-700 text-sm">
                    <span>{agent.listed}</span> Properties Listed | 
                    <span> {agent.sold}</span> Sold | 
                    <span> {agent.rent || "0"} Rented</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center sm:flex-row gap-3 py-4">
              <Link href="/agent/allagent/agentDetails">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-[#2D3748] text-white hover:text-white hover:bg-[#1a202c] border-[#2D3748]"
                >
                  View Profile
                </Button>
              </Link>
              <Link href="/agent/allagent/agentDetails">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  <IoCallOutline />
                  Call Agent
                </Button>
              </Link>
              <Link href="/agent/allagent/agentDetails">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  <FaRegMessage />
                  Send Message
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-8">
        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </Button>
        
        {/* Page Numbers */}
        {pageNumbers.map((number, index) => (
          <div key={index}>
            {number === "..." ? (
              <span className="px-3 py-2">...</span>
            ) : (
              <Button
                variant={currentPage === number ? "default" : "outline"}
                onClick={() => handlePageChange(number)}
                className={`px-3 py-2 ${
                  currentPage === number 
                    ? "bg-[#2D3748] rounded-full text-white hover:bg-[#1a202c]" 
                    : "border-none hover:bg-gray-50"
                }`}
              >
                {number}
              </Button>
            )}
          </div>
        ))}
        
        {/* Next Button */}
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default Agents;