"use client";
import { FiChevronDown } from 'react-icons/fi';
import { CiSearch } from "react-icons/ci";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { CiFilter } from "react-icons/ci";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";

const Body = () => {
	const form = useForm({
    defaultValues: {
      search: "",
    }
  });

  // State for location dropdown
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isDocumentDropdownOpen, setIsDocumentDropdownOpen] = useState(false);
  const [isMinPriceDropdownOpen, setIsMinPriceDropdownOpen] = useState(false);
  const [isMaxPriceDropdownOpen, setIsMaxPriceDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedDocument, setSelectedDocument] = useState("Any")
  const [selectedMinPrice, setSelectedMinPrice] = useState("No Min");
  const [selectedMaxPrice, setSelectedMaxPrice] = useState("No Max");
  const [selectedFilter, setSelectedFilter] = useState("Newest First");

  const locationRef = useRef(null);
  const documentRef = useRef(null);
  const minPriceRef = useRef(null);
  const maxPriceRef = useRef(null);
  const filterRef = useRef(null);

  const onSubmit = (data) => {
    console.log(data);
    // Handle form submission here (e.g., search functionality)
  };

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

  const documentOptions = ["Any", "C of O", "Deed", "Survey Plan", "Governor's Consent", "Excision"];
  const minPriceOptions = ["No Min", "N1M", "N2M", "N3M", "N4M", "N5M"];
  const maxPriceOptions = ["No Max", "N2M", "N3M", "N4M", "N5M", "N6M"];
  const filterOptions = ["Newest First", "Price: Low to High", "Price: High to Low", "Most Popular"];

  const toggleDropdown = (dropdownType, closeOthers = true) => {
    if (closeOthers) {
      setIsLocationDropdownOpen(false);
      setIsDocumentDropdownOpen(false);
      setIsMinPriceDropdownOpen(false);
      setIsMaxPriceDropdownOpen(false);
      setIsFilterDropdownOpen(false);
    }
  
  switch(dropdownType) {
      case 'location':
        setIsLocationDropdownOpen(!isLocationDropdownOpen);
        break;
      case 'document':
        setIsDocumentDropdownOpen(!isDocumentDropdownOpen);
        break;
      case 'minPrice':
        setIsMinPriceDropdownOpen(!isMinPriceDropdownOpen);
        break;
      case 'maxPrice':
        setIsMaxPriceDropdownOpen(!isMaxPriceDropdownOpen);
        break;
      case 'filter':
        setIsFilterDropdownOpen(!isFilterDropdownOpen);
        break;
    }
  };  
    
    
  const handleLocationSelect = (location) => {
    setSelectedArea(location);
    setIsLocationDropdownOpen(false);
  };

  const handleDocumentSelect = (option) => {
    setSelectedDocument(option);
    setIsDocumentDropdownOpen(false);
  };

  const handleMinPriceSelect = (option) => {
    setSelectedMinPrice(option);
    setIsMinPriceDropdownOpen(false);
  };

  const handleMaxPriceSelect = (option) => {
    setSelectedMaxPrice(option);
    setIsMaxPriceDropdownOpen(false);
  };

  const handleFilterSelect = (option) => {
    setSelectedFilter(option);
    setIsFilterDropdownOpen(false);
  };

  const resetLocationFilter = () => {
    setSelectedArea("All Areas");
    setIsLocationDropdownOpen(false);
  };

  const resetDocumentFilter = () => {
    setSelectedDocument("Any");
    setIsDocumentDropdownOpen(false);
  };

  const resetMinPriceFilter = () => {
    setSelectedMinPrice("No Min");
    setIsMinPriceDropdownOpen(false);
  };

  const resetMaxPriceFilter = () => {
    setSelectedMaxPrice("No Max");
    setIsMaxPriceDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsLocationDropdownOpen(false);
      }
      if (documentRef.current && !documentRef.current.contains(event.target)) {
        setIsDocumentDropdownOpen(false);
      }
      if (minPriceRef.current && !minPriceRef.current.contains(event.target)) {
        setIsMinPriceDropdownOpen(false);
      }
      if (maxPriceRef.current && !maxPriceRef.current.contains(event.target)) {
        setIsMaxPriceDropdownOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div>
			<div className="mb-10">
        <h1 className="text-5xl text-black font-bold pb-3">Lands for sales in lagos</h1>
        <p className="text-md text-gray-400">Find lands for sale near you.</p>
      </div>
			{/* Filter Section */}
			<div className="flex flex-col md:flex-row items-stretch md:items-end justify-center border-2 px-6 py-6 md:px-2 md:py-4 rounded-md border-gray-300 gap-3 mb-8 w-full">
				{/* Location Filter */}
				<div className="relative w-full md:w-200" ref={locationRef}>
					<div className="text-gray-500 text-sm mb-1">Location</div>
					<div className="flex flex-wrap gap-3">
						<button 
							onClick={() => toggleDropdown('location')}
							className="flex items-center justify-between border-2 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors w-full relative"
						> 
							{selectedArea}
							<FiChevronDown className="ml-1.5" />
						</button>
						
						{/* Dropdown Menu */}
						{isLocationDropdownOpen && (
							<div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
								{/* All Areas option */}
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
											className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded transition-colors ${selectedArea === location ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
										>
											{location}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
				
				{/* Document Filter */}
				<div className="relative w-full md:w-200" ref={documentRef}>
					<div className="text-gray-500 text-sm mb-1">Document</div>
					<div className="flex flex-wrap gap-3">
						<button 
							onClick={() => toggleDropdown('document')}
							className="flex items-center justify-between border-2 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors w-full"
						> 
							{selectedDocument}
							<FiChevronDown className="ml-1.5" />
						</button>
						
						{/* Document Dropdown Menu */}
						{isDocumentDropdownOpen && (
							<div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
								{/* Any option */}
								<button
									onClick={resetDocumentFilter}
									className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
								>
									<span className="font-medium">Any</span>
								</button>
								
								{/* Divider */}
								<div className="border-t border-gray-200 my-1"></div>
								
								{/* Document options */}
								<div className="flex flex-col gap-1 p-2">
									{documentOptions.slice(1).map((option, index) => (
										<button
											key={index}
											onClick={() => handleDocumentSelect(option)}
											className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded transition-colors ${selectedDocument === option ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
										>
											{option}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
				
				{/* Min Price Filter */}
				<div className="relative w-full md:w-200" ref={minPriceRef}>
					<div className="text-gray-500 text-sm mb-1">Min Price</div>
					<div className="flex flex-wrap gap-3">
						<button 
							onClick={() => toggleDropdown('minPrice')}
							className="flex items-center justify-between border-2 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors w-full"
						> 
							{selectedMinPrice}
							<FiChevronDown className="ml-1.5" />
						</button>
						
						{/* Min Price Dropdown Menu */}
						{isMinPriceDropdownOpen && (
							<div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
								{/* No Min option */}
								<button
									onClick={resetMinPriceFilter}
									className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
								>
									<span className="font-medium">No Min</span>
								</button>
								
								{/* Divider */}
								<div className="border-t border-gray-200 my-1"></div>
								
								{/* Min Price options */}
								<div className="flex flex-col gap-1 p-2">
									{minPriceOptions.slice(1).map((option, index) => (
										<button
											key={index}
											onClick={() => handleMinPriceSelect(option)}
											className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded transition-colors ${selectedMinPrice === option ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
										>
											{option}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
				
				{/* Max Price Filter */}
				<div className="relative w-full md:w-200" ref={maxPriceRef}>
					<div className="text-gray-500 text-sm mb-1">Max Price</div>
					<div className="flex flex-wrap gap-3">
						<button 
							onClick={() => toggleDropdown('maxPrice')}
							className="flex items-center justify-between border-2 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors w-full"
						> 
							{selectedMaxPrice}
							<FiChevronDown className="ml-1.5" />
						</button>
						
						{/* Max Price Dropdown Menu */}
						{isMaxPriceDropdownOpen && (
							<div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
								{/* No Max option */}
								<button
									onClick={resetMaxPriceFilter}
									className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
								>
									<span className="font-medium">No Max</span>
								</button>
								
								{/* Divider */}
								<div className="border-t border-gray-200 my-1"></div>
								
								{/* Max Price options */}
								<div className="flex flex-col gap-1 p-2">
									{maxPriceOptions.slice(1).map((option, index) => (
										<button
											key={index}
											onClick={() => handleMaxPriceSelect(option)}
											className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded transition-colors ${selectedMaxPrice === option ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
										>
											{option}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* filter */}
				<div>
					<div className='flex items-center'>
						<div className="text-gray-500 text-sm mb-1"> </div>
						<div className="flex flex-wrap gap-3">
							<button className="flex items-center gap-4 md:gap-2 border-2 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors w-[200px] max-w-[200px] sm:w-full"> 
								<CiFilter className="ml-1.5" />
								Filter
							</button>
						</div>
					</div>  
				</div>
				

				{/* Search Input */}
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
											<FormLabel className="sr-only">Search by location</FormLabel>
											<FormControl>
												<div className="relative">
													<CiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 z-10" />
													<Input 
														placeholder="Search by location" 
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
    </div>
  )
}

export default Body