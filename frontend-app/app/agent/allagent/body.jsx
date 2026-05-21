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
} from "@/components/ui/form";
import { Controller, useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";

const Body = () => {
	const form = useForm({
		defaultValues: {
			search: "",
		}
	});

	// State for location dropdown
	const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
	const [isPropertyTypeDropdownOpen, setIsPropertyTypeDropdownOpen] = useState(false);
	const [isSpecializationDropdownOpen, setIsSpecializationDropdownOpen] = useState(false);

	const [selectedArea, setSelectedArea] = useState("All Areas");
	const [selectedPropertyType, setSelectedPropertyType] = useState("All Types");
	const [selectedSpecialization, setSelectedSpecialization] = useState("All Types");


	const locationRef = useRef(null);
	const propertyTypeRef = useRef(null);
	const specializationRef = useRef(null);


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

	const propertyTypeOptions = ["Apartment", "Land", "Shop", "Shared Home", "Shortlet"];
	const specializationOptions = ["All Types","Sell", "Rent"];


	const toggleDropdown = (dropdownType, closeOthers = true) => {
		if (closeOthers) {
			setIsLocationDropdownOpen(false);
			setIsPropertyTypeDropdownOpen(false);
			setIsSpecializationDropdownOpen(false);
		}
	
	switch(dropdownType) {
			case 'location':
				setIsLocationDropdownOpen(!isLocationDropdownOpen);
				break;
			case 'propertyType':
				setIsPropertyTypeDropdownOpen(!isPropertyTypeDropdownOpen);
				break;
			case 'specialization':
				setIsSpecializationDropdownOpen(!isSpecializationDropdownOpen);
				break;
		}
	};  
		
		
	const handleLocationSelect = (location) => {
		setSelectedArea(location);
		setIsLocationDropdownOpen(false);
	};

	const handlePropertyTypeSelect = (option) => {
		setSelectedPropertyType(option);
		setIsPropertyTypeDropdownOpen(false);
	};

	const handleSpecializationSelect = (option) => {
		setSelectedSpecialization(option);
		setIsSpecializationDropdownOpen(false);
	};

	const resetLocationFilter = () => {
		setSelectedArea("All Areas");
		setIsLocationDropdownOpen(false);
	};

	const resetPropertyTypeFilter = () => {
		setSelectedPropertyType("Any");
		setIsPropertyTypeDropdownOpen(false);
	};

	const resetSpecializationFilter = () => {
		setSelectedSpecialization("No Specialization");
		setIsSpecializationDropdownOpen(false);
	};


	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (locationRef.current && !locationRef.current.contains(event.target)) {
				setIsLocationDropdownOpen(false);
			}
			if (propertyTypeRef.current && !propertyTypeRef.current.contains(event.target)) {
				setIsPropertyTypeDropdownOpen(false);
			}
			if (specializationRef.current && !specializationRef.current.contains(event.target)) {
				setIsSpecializationDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<div className='mb-20'>
			<div className="mb-10">
				<h1 className="text-5xl text-black font-bold pb-3">Meet Verified Agents Near You</h1>
				<p className="text-md text-gray-400">Trusted real estate agents across major locations in Lagos</p>
			</div>
			<div>
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
					
					{/* Property Type Filter */}
					<div className="relative w-full md:w-200" ref={propertyTypeRef}>
						<div className="text-gray-500 text-sm mb-1">Property Type</div>
						<div className="flex flex-wrap gap-3">
							<button 
								onClick={() => toggleDropdown('propertyType')}
								className="flex items-center justify-between border-2 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors w-full"
							> 
								{selectedPropertyType}
								<FiChevronDown className="ml-1.5" />
							</button>
							
							{/* Property Type Dropdown Menu */}
							{isPropertyTypeDropdownOpen && (
								<div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
									{/* Any option */}
									<button
										onClick={resetPropertyTypeFilter}
										className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
									>
										<span className="font-medium">All Types</span>
									</button>
									
									{/* Divider */}
									<div className="border-t border-gray-200 my-1"></div>
									
									{/* Property Type options */}
									<div className="flex flex-col gap-1 p-2">
										{propertyTypeOptions.slice(1).map((option, index) => (
											<button
												key={index}
												onClick={() => handlePropertyTypeSelect(option)}
												className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded transition-colors ${selectedPropertyType === option ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
											>
												{option}
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
					
					{/* Specialization Filter */}
					<div className="relative w-full md:w-200" ref={specializationRef}>
						<div className="text-gray-500 text-sm mb-1">Specialization</div>
						<div className="flex flex-wrap gap-3">
							<button 
								onClick={() => toggleDropdown('specialization')}
								className="flex items-center justify-between border-2 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors w-full"
							> 
								{selectedSpecialization}
								<FiChevronDown className="ml-1.5" />
							</button>
							
							{/* Specialization Dropdown Menu */}
							{isSpecializationDropdownOpen && (
								<div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
									{/* No Specialization option */}
									<button
										onClick={resetSpecializationFilter}
										className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
									>
										<span className="font-medium">All Types</span>
									</button>
									
									{/* Divider */}
									<div className="border-t border-gray-200 my-1"></div>
									
									{/* Specialization options */}
									<div className="flex flex-col gap-1 p-2">
										{specializationOptions.slice(1).map((option, index) => (
											<button
												key={index}
												onClick={() => handleSpecializationSelect(option)}
												className={`px-3 py-2 text-sm text-left hover:bg-gray-100 rounded transition-colors ${selectedSpecialization === option ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
											>
												{option}
											</button>
										))}
									</div>
								</div>
							)}
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
		</div>
	)
}

export default Body
