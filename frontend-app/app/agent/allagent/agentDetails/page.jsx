"use client";


import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Footer from '@/components/Footer';

import { IoMdArrowRoundBack } from "react-icons/io";
import { MdVerified } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import { MdApartment } from "react-icons/md";
import { AiTwotoneShop } from "react-icons/ai";
import { GiIsland } from "react-icons/gi";
import { FaHome } from "react-icons/fa";
import { FaBed } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { IoCall } from "react-icons/io5"

import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaAngleRight } from 'react-icons/fa';
import { FaAngleLeft } from 'react-icons/fa';
import { TbRuler3 } from "react-icons/tb";
import { IoBedOutline } from "react-icons/io5";
import { MdOutlineShower } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";



const categories = ["Active Listings", "Sold", "Rented Out"];

const properties = [
  {
    image: "/assets/property_1.jpg",
    title: "Lekki Luxury Apartment 1",
    price: "₦1,000,000",
    location: "Lekki Phase 1, Lagos",
    size: "1634 sqft",
    beds: "4 bed",
    baths: "3 bath",
  },
  {
    image: "/assets/property_2.png",
    title: "Mainland Comfort Flat 2",
    price: "₦1,000,000",
    location: "Yaba, Lagos",
    size: "1634 sqft",
    beds: "3 beds",
    baths: "3 bath",
  },
  {
    image: "/assets/property_3.jpg",
    title: "Island View Apartment 3",
    price: "₦1,000,000",
    location: "Victoria Island, Lagos",
    size: "1634 sqft",
    beds: "2 beds",
    baths: "3 bath",
  },
  {
    image: "/assets/property_4.jpg",
    title: "Epe Garden Land 4",
    price: "₦1,000,000",
    location: "Epe, Lagos",
    size: "1634 sqm",
    beds: "...",
    baths: "...",
  },
  {
    image: "/assets/property_5.png",
    title: "Mainland Comfort Flat 5",
    price: "₦1,000,000",
    location: "Yaba, Lagos",
    size: "1634 sqft",
    beds: "3 beds",
    baths: "3 bath",
  },
  {
    image: "/assets/property_6.jpg",
    title: "Lekki Luxury Apartment 6",
    price: "₦1,000,000",
    location: "Lekki Phase 1, Lagos",
    size: "1634 sqft",
    beds: "4 bed",
    baths: "3 bath",
  },
  {
    image: "/assets/property_7.jpg",
    title: "Epe Garden Land 7",
    price: "₦1,000,000",
    location: "Epe, Lagos",
    size: "1634 sqm",
    beds: "...",
    baths: "...",
  },
  {
    image: "/assets/property_8.jpg",
    title: "Island View Apartment 8",
    price: "₦1,000,000",
    location: "Victoria Island, Lagos",
    size: "1634 sqft",
    beds: "2 beds",
    baths: "3 bath",
  },
];

const page = () => {

	const [activeTab, setActiveTab] = useState("Active Listings");
	const [currentSlide, setCurrentSlide] = useState(0);
		const [favorites, setFavorites] = useState(
			Array(properties.length).fill(false)
		);
		const [propertiesPerSlide, setPropertiesPerSlide] = useState(1);
		const [isMobile, setIsMobile] = useState(false);

		// Detect screen size
			useEffect(() => {
				const handleResize = () => {
					const width = window.innerWidth;
					/* setIsMobile(width < 768); */
					
					if (width < 640) {
						setPropertiesPerSlide(1);
					} else if (width >= 640 && width < 768) {
						setPropertiesPerSlide(2);
					} else if (width >= 768 && width < 1024) {
						setPropertiesPerSlide(2);
					} else if (width >= 1024 && width < 1280) {
						setPropertiesPerSlide(3);
					} else {
						setPropertiesPerSlide(4);
					}
					
					setCurrentSlide(0);
				};
		
				handleResize();
				window.addEventListener("resize", handleResize);
				return () => window.removeEventListener("resize", handleResize);
			}, []);
		
			const totalSlides = properties.length - propertiesPerSlide + 1;
		
			const nextSlide = () => {
				setCurrentSlide((prev) => {
					const next = prev + 1;
					return next < totalSlides ? next : prev;
				});
			};
		
			const prevSlide = () => {
				setCurrentSlide((prev) => {
					const prevSlideIndex = prev - 1;
					return prevSlideIndex >= 0 ? prevSlideIndex : prev;
				});
			};
		
			const toggleFavorite = (i) => {
				setFavorites((prev) => {
					const updated = [...prev];
					updated[i] = !updated[i];
					return updated;
				});
			};
		
			const startIndex = currentSlide;
			const visibleProperties = properties.slice(startIndex, startIndex + propertiesPerSlide);
			const numberOfDots = Math.min(totalSlides, 4);
		


	return (
		<div>
			<div className="container mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-20">
				<div className="pb-10">
					<Link href="/agent/allagent/TopAgents" className="flex items-center gap-3 text-xl font-bold">
						<IoMdArrowRoundBack /> Back to Search
					</Link>
				</div>
				<div className="mb-12">
					<div className="grid grid-cols-1 justify-items-center sm:grid-cols-2 gap-4">
						<div className="sm:h-full sm:w-full sm:px-0 relative h-150 w-150">
							<Image src="/assets/agent-1.png" alt="" className="object-contain px-5 sm:px-0" fill />
						</div>
						<div className="grid grid-cols-1 gap-4 w-full">
							{/* upper Tabs */}
							<div className="mx-w-md bg-white border-2 rounded-2xl shadow-xl overflow-hidden p-6">
								<div className="text-semibold uppercase text-md flex gap-5">
									<button className="px-6 cursor-pointer rounded-full text-green-800 bg-green-300">sell</button>
									<button className="px-6 cursor-pointer rounded-full text-green-800 bg-green-300">rent</button>
								</div>
								<div className="flex flex-col gap-3 mt-4">
									<div className="flex items-center gap-4"><h1>Chika Nwosu</h1>< MdVerified /></div>
									<div className="flex flex-col gap-3">
										<p className="text-sm text-gray-400">GreenField Realty</p>
										<div className="flex items-center gap-6">
											<span className="text-gray-400">4.9</span>
											<div className="flex">
												{[...Array(4)].map((_, index) => (
													<FaStar key={index} className="w-6 h-6 text-yellow-500" /> 
												))}
												<CiStar className="w-6 h-6 text-gray-400" />
											</div>
											<span className="text-gray-400">128 Reviews</span>
										</div>
										<p className="uppercase text-black">specialization</p>
										<div className="flex items-center gap-8">
											<div className="flex items-center gap-2">
												<MdApartment className="text-gray-500" />
												<p className="text-gray-500 text-sm font-semibold">Apartment</p>
											</div>
											<div className="flex items-center gap-2">
												<AiTwotoneShop className="text-gray-500" />
												<p className="text-gray-500 text-sm font-semibold">Shop</p>
											</div>
											<div className="flex items-center gap-2">
												<GiIsland className="text-gray-500" />
												<p className="text-gray-500 text-sm font-semibold">Land</p>
											</div>
											<div className="flex items-center gap-2">
												<FaHome className="text-gray-500" />
												<p className="text-gray-500 text-sm font-semibold">Shared Home</p>
											</div>
											<div className="flex items-center gap-2">
												<FaBed className="text-gray-500" />
												<p className="text-gray-500 text-sm font-semibold">Shortlets</p>
											</div>
										</div>
									</div>
								</div>
							</div>
							{/* bottom tab */}
							<div className="mx-w-md bg-white border-2 rounded-2xl shadow-xl overflow-hidden p-6">
								<div className=" ">
									<h3 className="text-lg font-semibold text-gray-800 mb-3">Write a message</h3>
									<textarea
										className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-gray-400"
										rows={4}
										placeholder="Hello, I'd like more info about Ajah Luxury Apartment."
										defaultValue="Hello, I'd like more info about Ajah Luxury Apartment."
									/>
									<Button className="w-full mt-4 flex items-center justify-center gap-2 text-white font-semibold py-7 px-6 rounded-xl transition-colors">
										<FaMessage className="w-5 h-5" />
										Send Message
									</Button>
								</div>
								{/* Call Button */}
								<Button className="w-full mt-4 flex items-center bg-transparent justify-center gap-2 border-2 border-[#2c3e50] text-[#2c3e50] hover:text-white font-semibold py-7 px-6 rounded-xl transition-colors">
									<IoCall className="w-4 h-4" />
									Call Agent
								</Button>
							</div>
						</div>
					</div>
				</div>
				{/* achievement */}
				<div className="my-6 flex items-center justify-between px-6">
					<div className="flex flex-col items-center">
						<span className="text-2xl font-bold">42</span>
						<span className="text-sm text-gray-400">Properties Listed</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="text-2xl font-bold">9</span>
						<span className="text-sm text-gray-400">Active Listing</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="text-2xl font-bold">31</span>
						<span className="text-sm text-gray-400">Sold</span>
					</div>
					<div className="flex flex-col items-center">
						<span className="text-2xl font-bold">2</span>
						<span className="text-sm text-gray-400">Rented</span>
					</div>
				</div>
				{/* about chika */}
				<div className="border-2 w-full p-6 mb-6">
					<h1 className="text-md font-bold mb-2 uppercase">About Chika</h1>
					<p className="text-gray-400 leading-snug tracking-tight">As a result of my vast experience, as well as my abilities to reflect values most important
						to Home Buddy and myself, I am able to bring abundance of professionalism and experience to my clients "Astute, detail
						oriented, and caring" are three adjectives most used to describe me.
					</p>
				</div>
				{/* Active listing, sold rented out */}
				<Tabs className="flex " defaultValue="Active Listings">
					<TabsList className="flex space-x-4 md:space-x-8 overflow-x-auto pb-2 md:pb-0 mb-6">
						{categories.map((category, catIndex) =>{
						return (
							<TabsTrigger key={catIndex} value={category}
							className={`flex-shrink-0 pb-2 px-1 text-sm md:text-base  ${
								activeTab === category 
									? "text-black font-semibold border-b-2 border-black" 
									: "text-gray-500 hover:text-gray-700"
							}`} onClick={() => setActiveTab(category)} 
							>
								{category}
							</TabsTrigger>
						)
						})}	
					</TabsList>
					
					{/* Tabs content */}
					<div>
						{/* Active Listings */}
						<TabsContent value="Active Listings">
							<div className={`grid grid-cols-1 ${propertiesPerSlide >= 2 ? 'sm:grid-cols-2' : ''} ${propertiesPerSlide >= 3 ? 'md:grid-cols-3' : ''} ${propertiesPerSlide >= 4 ? 'lg:grid-cols-4' : ''} gap-4 md:gap-6 mb-6`}>
								{visibleProperties.map((property, idx) => {
									const propertyIndex = startIndex + idx;
									return (
										<div key={propertyIndex} className="relative bg-white w-full rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-shadow duration-300 overflow-hidden">
											{/* Image container */}
											<div className="relative h-48 sm:h-56">
												<img src={property.image} className="w-full h-full object-cover" loading="lazy" />
												<div className="text-green-500 uppercase font-bold z-10 absolute top-3 left-3 bg-white px-4 py-1 rounded-xl">for rent</div>
											</div>
											
											{/* Property details */}
												<div className="mx-4 relative top-[-40px] p-4 flex border-2 bg-white rounded-xl shadow-[4px_4px_10px_rgba(0,0,0,0.15)]">
													<div className="">
														<div className="mb-3">
															<h3 className="font-semibold text-gray-800 text-base sm:text-lg line-clamp-1">
																{property.title}
															</h3>
															<p className="font-bold text-lg sm:text-xl mt-1 text-gray-900">
																{property.price}
															</p>
														</div>
												
														{/* Location */}
														<div className="flex items-start gap-1 mb-4">
															<CiLocationOn className="text-gray-500 mt-0.5 flex-shrink-0" />
															<p className="text-gray-600 text-sm line-clamp-2">{property.location}</p>
														</div>
													</div>
													{/* Favorite button - positioned on image */}
													<button
														onClick={() => toggleFavorite(propertyIndex)}
														className="absolute top-3 right-4 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
													>
														{favorites[propertyIndex] ? (
															<FaHeart className="text-lg sm:text-xl text-red-500" />
														) : (
															<FaRegHeart className="text-lg sm:text-xl text-gray-600" />
														)}
													</button>
												</div>
												
			
											{/* Property features - responsive layout */}
												<div className="flex justify-between border-t border-gray-100 p-4">
													
													<div className="flex flex-row items-center gap-1">
														<TbRuler3 className="text-gray-500 text-lg" />
														<span className="font-medium text-gray-700 text-xs sm:text-sm">{property.size}</span>
													</div>
												
													<div className="flex flex-row items-center gap-1">
														<IoBedOutline className="text-gray-500 text-lg" />
														<span className="font-medium text-gray-700 text-xs sm:text-sm">{property.beds}</span>
													</div>
												
													<div className="flex flex-row items-center gap-1">
														<MdOutlineShower className="text-gray-500 text-lg" />
														<span className="font-medium text-gray-700 text-xs sm:text-sm">{property.baths}</span>
													</div>
												</div>
										</div>
									);
								})}
							</div>
						</TabsContent>

						{/* Sold */}
						<TabsContent value="Sold">
							<div className={`grid grid-cols-1 ${propertiesPerSlide >= 2 ? 'sm:grid-cols-2' : ''} ${propertiesPerSlide >= 3 ? 'md:grid-cols-3' : ''} ${propertiesPerSlide >= 4 ? 'lg:grid-cols-4' : ''} gap-4 md:gap-6 mb-6`}>
								{visibleProperties.map((property, idx) => {
									const propertyIndex = startIndex + idx;
									return (
										<div key={propertyIndex} className="relative bg-white w-full rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-shadow duration-300 overflow-hidden">
											{/* Image container */}
											<div className="relative h-48 sm:h-56">
												<img src={property.image} className="w-full h-full object-cover" loading="lazy" />
												<div className="text-green-500 uppercase font-bold z-10 absolute top-3 left-3 bg-white px-4 py-1 rounded-xl">for rent</div>
											</div>
											
											{/* Property details */}
											<div className="mx-4 relative top-[-40px] p-4 flex border-2 bg-white rounded-xl shadow-[4px_4px_10px_rgba(0,0,0,0.15)]">
												<div className="">
													<div className="mb-3">
														<h3 className="font-semibold text-gray-800 text-base sm:text-lg line-clamp-1">
															{property.title}
														</h3>
														<p className="font-bold text-lg sm:text-xl mt-1 text-gray-900">
															{property.price}
														</p>
													</div>
											
													{/* Location */}
													<div className="flex items-start gap-1 mb-4">
														<CiLocationOn className="text-gray-500 mt-0.5 flex-shrink-0" />
														<p className="text-gray-600 text-sm line-clamp-2">{property.location}</p>
													</div>
												</div>
												{/* Favorite button - positioned on image */}
												<button
													onClick={() => toggleFavorite(propertyIndex)}
													className="absolute top-3 right-4 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
												>
													{favorites[propertyIndex] ? (
														<FaHeart className="text-lg sm:text-xl text-red-500" />
													) : (
														<FaRegHeart className="text-lg sm:text-xl text-gray-600" />
													)}
												</button>
											</div>
											
		
										{/* Property features - responsive layout */}
										<div className="flex justify-between border-t border-gray-100 p-4">
											
											<div className="flex flex-row items-center gap-1">
												<TbRuler3 className="text-gray-500 text-lg" />
												<span className="font-medium text-gray-700 text-xs sm:text-sm">{property.size}</span>
											</div>
										
											<div className="flex flex-row items-center gap-1">
												<IoBedOutline className="text-gray-500 text-lg" />
												<span className="font-medium text-gray-700 text-xs sm:text-sm">{property.beds}</span>
											</div>
										
											<div className="flex flex-row items-center gap-1">
												<MdOutlineShower className="text-gray-500 text-lg" />
												<span className="font-medium text-gray-700 text-xs sm:text-sm">{property.baths}</span>
											</div>
										</div>
									</div>
									);
								})}
							</div>
						</TabsContent>

						{/* Rented Out */}
						<TabsContent value="Rented Out">
							<div className={`grid grid-cols-1 ${propertiesPerSlide >= 2 ? 'sm:grid-cols-2' : ''} ${propertiesPerSlide >= 3 ? 'md:grid-cols-3' : ''} ${propertiesPerSlide >= 4 ? 'lg:grid-cols-4' : ''} gap-4 md:gap-6 mb-6`}>
								{visibleProperties.map((property, idx) => {
									const propertyIndex = startIndex + idx;
									return (
										<div key={propertyIndex} className="relative bg-white w-full rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-shadow duration-300 overflow-hidden">
											{/* Image container */}
											<div className="relative h-48 sm:h-56">
												<img src={property.image} className="w-full h-full object-cover" loading="lazy" />
												<div className="text-green-500 uppercase font-bold z-10 absolute top-3 left-3 bg-white px-4 py-1 rounded-xl">for rent</div>
											</div>
											
											{/* Property details */}
											<div className="mx-4 relative top-[-40px] p-4 flex border-2 bg-white rounded-xl shadow-[4px_4px_10px_rgba(0,0,0,0.15)]">
												<div className="">
													<div className="mb-3">
														<h3 className="font-semibold text-gray-800 text-base sm:text-lg line-clamp-1">
															{property.title}
														</h3>
														<p className="font-bold text-lg sm:text-xl mt-1 text-gray-900">
															{property.price}
														</p>
													</div>
											
													{/* Location */}
													<div className="flex items-start gap-1 mb-4">
														<CiLocationOn className="text-gray-500 mt-0.5 flex-shrink-0" />
														<p className="text-gray-600 text-sm line-clamp-2">{property.location}</p>
													</div>
												</div>
												{/* Favorite button - positioned on image */}
												<button
													onClick={() => toggleFavorite(propertyIndex)}
													className="absolute top-3 right-4 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
												>
													{favorites[propertyIndex] ? (
														<FaHeart className="text-lg sm:text-xl text-red-500" />
													) : (
														<FaRegHeart className="text-lg sm:text-xl text-gray-600" />
													)}
												</button>
											</div>
												
			
											{/* Property features - responsive layout */}
											<div className="flex justify-between border-t border-gray-100 p-4">
												
												<div className="flex flex-row items-center gap-1">
													<TbRuler3 className="text-gray-500 text-lg" />
													<span className="font-medium text-gray-700 text-xs sm:text-sm">{property.size}</span>
												</div>
											
												<div className="flex flex-row items-center gap-1">
													<IoBedOutline className="text-gray-500 text-lg" />
													<span className="font-medium text-gray-700 text-xs sm:text-sm">{property.beds}</span>
												</div>
											
												<div className="flex flex-row items-center gap-1">
													<MdOutlineShower className="text-gray-500 text-lg" />
													<span className="font-medium text-gray-700 text-xs sm:text-sm">{property.baths}</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</TabsContent>
					</div>
				</Tabs>
			</div>
			<Footer />
		</div>
		
	)
}

export default page