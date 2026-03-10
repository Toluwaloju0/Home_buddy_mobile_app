"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"; 
import Link from "next/link";
import DashboardNav from "@/components/DashboardNav";

import { FiDownload } from "react-icons/fi";
import { FaAngleDown } from "react-icons/fa";
import { FiChevronDown } from 'react-icons/fi';
import { FaArrowLeft } from "react-icons/fa6";
import { FaArrowRight } from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

const page = () => {

  const form = useForm({
		defaultValues: {
			search: "",
		}
	});

  const onSubmit = (data) => {
		console.log(data);
		// Handle form submission here (e.g., search functionality)
	};


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [isSortByDropdownOpen, setIsSortByDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isTransactionDropdownOpen, setIsTransactionDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const [selectedSortBy, setSelectedSortBy] = useState("Newest Agent");
  const [selectedLocation, setSelectedLocation] = useState("All Area");
  const [selectedTransaction, setSelectedTransaction] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const sortByRef = useRef(null);
  const locationRef = useRef(null);
  const statusRef = useRef(null);
  const transactionRef = useRef(null);

  

  const sortBy = [
    "Newest Agent",
    "Oldest Agent",
    "Highest Rating",
    "Lowest Rating",
    "Most Listings",
    "Least Listings",
    "Recently Verified"
  ];

  const locations = [
		"Alan",
    "Berger",
    "Epe",
    "Obagada",
    "Ikorodu",
    "Ikoyi",
    "Lekki",
    "Victoria Island",
    "Yaba"
	];

  const transactions = [
    "Sale",
    "Rent"
  ];

  const status = [
    "Verified",
    "Pending Review",
    "Flagged",
    "Suspended",
    "Rejected"
  ];

  // Sample agent data for the table
  const agents = [
    { name: "Chika Nwosu", location: "Ajah", transactionType: "Sale, Rent", listings: 42, ratings: "4.9 ★", status: "Verified" },
    { name: "Kunle Adebayo", location: "Berger", transactionType: "Sale", listings: 40, ratings: "4.7 ★", status: "Suspended" },
    { name: "Sarah Johnson", location: "Epe", transactionType: "-", listings: "-", ratings: "-", status: "Pending Review" },
    { name: "Peter Parker", location: "Ikoyi", transactionType: "-", listings: "-", ratings: "-", status: "Rejected" },
    { name: "Jane Doe", location: "V.I", transactionType: "Rent", listings: 18, ratings: "4.9 ★", status: "Flagged" }
  ];

  const toggleDropdown = (dropdownType, closeOthers = true) => {
    if (closeOthers) {
      setIsLocationDropdownOpen(false);
      setIsSortByDropdownOpen(false);
      setIsStatusDropdownOpen(false);
      setIsTransactionDropdownOpen(false);
    }

    switch(dropdownType) {
      case 'sortBy':
        setIsSortByDropdownOpen(!isSortByDropdownOpen);
        break;
      case 'location':
        setIsLocationDropdownOpen(!isLocationDropdownOpen);
        break;
      case 'status':
        setIsStatusDropdownOpen(!isStatusDropdownOpen);
        break;
      case 'transaction':
        setIsTransactionDropdownOpen(!isTransactionDropdownOpen);
        break;
    }
  };

  const handleSortBySelect = (option) => {
    setSelectedSortBy(option);
    setIsSortByDropdownOpen(false);
  }; 

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setIsLocationDropdownOpen(false);
  }; 

  const handleStatusSelect = (option) => {
    setSelectedStatus(option);
    setIsStatusDropdownOpen(false);
  }; 

  const handleTransactionSelect = (option) => {
    setSelectedTransaction(option);
    setIsTransactionDropdownOpen(false);
  }; 

  const resetSortByFilter = () => {
    setSelectedSortBy("Newest Agent");
    setIsSortByDropdownOpen(false);
  };

  const resetLocationFilter = () => {
    setSelectedLocation("All Area");
    setIsLocationDropdownOpen(false);
  };

  const resetStatusFilter = () => {
    setSelectedStatus("All");
    setIsStatusDropdownOpen(false);
  };

  const resetTransactionFilter = () => {
    setSelectedTransaction("All Types");
    setIsTransactionDropdownOpen(false);
  };

  //close dropdown wen clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsLocationDropdownOpen(false);
      }
      if (sortByRef.current && !sortByRef.current.contains(event.target)) {
        setIsSortByDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.targer)) {
        setIsStatusDropdownOpen(false);
      }
      if (transactionRef.current && !transactionRef.current.contain(event.target)) {
        setIsTransactionDropdownOpen(false);
      }
    }
  })

  return (
    <>
      <DashboardNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-[300px]" : "ml-[80px]"}`}>
        
        <div className="p-10 xl:p-8">
          <div className="w-full flex items-center justify-between relative mb-5">
            <h1 className="text-xl font-bold">All Agents</h1>
            <Button onClick={() => setExportOpen(!exportOpen)} className="w-[200px] "><FiDownload className="text-2xl" />Export <FaAngleDown className={`text-2xl transition-transform ${exportOpen ? "rotate-180" : ""}`}/></Button>
            {exportOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg min-w-64 z-50 py-2 border-2">
                <div className="p-2 flex flex-col gap-2">
                  <Link href="/">Export as PDF</Link>
                  <Link href="/">Export as PDF</Link>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 xl:p-6 flex flex-col border-2 items-center justify-center border-gray-300 rounded-md">
            {/* Filter section */}
            <div className="flex flex-col md:flex-row items-stretch md:items-end justify-center gap-3 mb-8 w-full">
              {/* SortBy Filter */}
              <div className="relative w-full md:w-200" ref={sortByRef}>
                <div className="text-gray-500 text-sm mb-1 font-semibold">SortBy</div>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => toggleDropdown('sortBy')}
                    className="flex items-center justify-between border-2 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors w-full relative"
                  > 
                    {selectedLocation}
                    <FiChevronDown className="ml-1.5" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isSortByDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {/* All Areas option */}
                      <button
                        onClick={resetSortByFilter}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium">Newest Agent</span>
                      </button>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200 my-1"></div>
                      
                      {/* SortBy options */}
                      <div className="flex flex-col gap-1 p-2">
                        {sortBy.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleSortBySelect(option)}
                            className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded transition-colors ${selectedSortBy === option ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
					
              {/* Location Filter */}
              <div className="relative w-full md:w-200" ref={locationRef}>
                <div className="text-gray-500 text-sm mb-1 font-semibold">Location</div>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => toggleDropdown('location')}
                    className="flex items-center justify-between border-2 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors w-full"
                  > 
                    {selectedLocation}
                    <FiChevronDown className="ml-1.5" />
                  </button>
                  
                  {/* Location Dropdown Menu */}
                  {isLocationDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                      {/* Any option */}
                      <button
                        onClick={resetLocationFilter}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium">All Areas</span>
                      </button>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200 my-1"></div>
                      
                      {/* Location options */}
                      <div className="flex flex-col gap-1 p-2">
                        {locations.map((location, index) => (
                          <button
                            key={index}
                            onClick={() => handleLocationSelect(location)}
                            className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded transition-colors ${selectedLocation === location ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
					
              {/* Transaction Filter */}
              <div className="relative w-full md:w-200" ref={transactionRef}>
                <div className="text-gray-500 text-sm mb-1 font-semibold">Transaction Types</div>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => toggleDropdown('transaction')}
                    className="flex items-center justify-between border-2 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors w-full"
                  > 
                    {selectedTransaction}
                    <FiChevronDown className="ml-1.5" />
                  </button>
                  
                  {/* Transaction Dropdown Menu */}
                  {isTransactionDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                      {/* No Transaction option */}
                      <button
                        onClick={resetTransactionFilter}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium">All Types</span>
                      </button>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200 my-1"></div>
                      
                      {/* Transaction options */}
                      <div className="flex flex-col gap-1 p-2">
                        {transactions.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleTransactionSelect(option)}
                            className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded transition-colors ${selectedTransaction === option ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            
              {/* Status Filter */}
              <div className="relative w-full md:w-200" ref={statusRef}>
                <div className="text-gray-500 text-sm mb-1 font-semibold">Status</div>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => toggleDropdown('status')}
                    className="flex items-center justify-between border-2 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors w-full"
                  > 
                    {selectedStatus}
                    <FiChevronDown className="ml-1.5" />
                  </button>
                  
                  {/* Status Dropdown Menu */}
                  {isStatusDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                      {/* No Status option */}
                      <button
                        onClick={resetStatusFilter}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium">All</span>
                      </button>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200 my-1"></div>
                      
                      {/* Status options */}
                      <div className="flex flex-col gap-1 p-2">
                        {status.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleStatusSelect(option)}
                            className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded transition-colors ${selectedStatus === option ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* search input  */}
            <div className="flex items-center gap-3 w-full mb-8">
              <div className="relative w-full">
                <CiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-[20] w-[20]" />
                <div className="relative flex-grown w-full">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                      <FormField
                        control={form.control}
                        name="search"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel className="sr-only">Search by Name...</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <CiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 z-10" />
                                <Input 
                                  placeholder="Search by Name..." 
                                  className="w-full border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 pl-12 pr-4 py-6 rounded-lg font-medium transition-colors outline-none"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex">
                <Link href="/join">
                  <Button className="px-8 py-6">Search</Button>
                </Link>
              </div>
            </div>

            {/* Agents Table */}
            <div className="w-full overflow-x-auto border-2 rounded-md">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 text-left text-gray-600">
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Location</th>
                    <th className="py-3 px-4 font-semibold">Transaction Type</th>
                    <th className="py-3 px-4 font-semibold">Listings</th>
                    <th className="py-3 px-4 font-semibold">Ratings</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">{agent.name}</td>
                      <td className="py-3 px-4">{agent.location}</td>
                      <td className="py-3 px-4">{agent.transactionType}</td>
                      <td className="py-3 px-4">{agent.listings}</td>
                      <td className="py-3 px-4">{agent.ratings}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agent.status === 'Verified' ? 'bg-green-100 text-green-800' :
                          agent.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                          agent.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-800' :
                          agent.status === 'Flagged' ? 'bg-orange-100 text-orange-800' :
                          agent.status === 'Rejected' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-gray-500 hover:text-gray-700">
                          <span className="text-xl">⋮</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
            <div className="flex items-center justify-between w-full p-4">
              {/* <div className="text-sm text-gray-500">
                Showing 1 to 5 of 50 results
              </div> */}
                <div className="flex items-center gap-2 justify-between w-full">
                  <Button variant="outline" className="p-5 border-2"><FaArrowLeft/>Previous</Button>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="px-3 py-1 bg-gray-500 rounded-full text-white">1</Button>
                    <Button variant="outline" size="sm" className="px-3 py-1">2</Button>
                    <Button variant="outline" size="sm" className="px-3 py-1">3</Button>
                    <span className="px-2">...</span>
                    <Button variant="outline" size="sm" className="px-3 py-1">8</Button>
                    <Button variant="outline" size="sm" className="px-3 py-1">9</Button>
                    <Button variant="outline" size="sm" className="px-3 py-1">10</Button>
                  </div>
                  <Button variant="outline" className="p-5 border-2">Next <FaArrowRight /></Button>
                </div>
              </div>
            </div>
            
             

          </div>
        </div>

      </div>
    </>
  )
}

export default page