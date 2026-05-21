"use client";

import { useState, useEffect } from "react";

import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaAngleRight } from 'react-icons/fa';
import { FaAngleLeft } from 'react-icons/fa';
import { TbRuler3 } from "react-icons/tb";
import { IoBedOutline } from "react-icons/io5";
import { MdOutlineShower } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";

const properties = [
	{
		image: "../assets/property_1.jpg",
		title: "Lekki Luxury Apartment 1",
		price: "₦1,000,000",
		location: "Lekki Phase 1, Lagos",
		size: "1634 sqft",
		beds: "4 bed",
		baths: "3 bath",
	},
	{
		image: "../assets/property_2.png",
		title: "Mainland Comfort Flat 2",
		price: "₦1,000,000",
		location: "Yaba, Lagos",
		size: "1634 sqft",
		beds: "3 beds",
		baths: "3 bath",
	},
	{
		image: "../assets/property_3.jpg",
		title: "Island View Apartment 3",
		price: "₦1,000,000",
		location: "Victoria Island, Lagos",
		size: "1634 sqft",
		beds: "2 beds",
		baths: "3 bath",
	},
	{
		image: "../assets/property_4.jpg",
		title: "Epe Garden Land 4",
		price: "₦1,000,000",
		location: "Epe, Lagos",
		size: "1634 sqm",
		beds: "...",
		baths: "...",
	},
	{
		image: "../assets/property_5.png",
		title: "Mainland Comfort Flat 5",
		price: "₦1,000,000",
		location: "Yaba, Lagos",
		size: "1634 sqft",
		beds: "3 beds",
		baths: "3 bath",
	},
	{
		image: "../assets/property_6.jpg",
		title: "Lekki Luxury Apartment 6",
		price: "₦1,000,000",
		location: "Lekki Phase 1, Lagos",
		size: "1634 sqft",
		beds: "4 bed",
		baths: "3 bath",
	},
	{
		image: "../assets/property_7.jpg",
		title: "Epe Garden Land 7",
		price: "₦1,000,000",
		location: "Epe, Lagos",
		size: "1634 sqm",
		beds: "...",
		baths: "...",
	},
	{
		image: "../assets/property_8.jpg",
		title: "Island View Apartment 8",
		price: "₦1,000,000",
		location: "Victoria Island, Lagos",
		size: "1634 sqft",
		beds: "2 beds",
		baths: "3 bath",
	},
];


const Ajah = () => {
	
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
				setIsMobile(width < 768);
				
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
		console.log(propertiesPerSlide)
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
			<div className="flex justify-between items-center mb-10">
				<h1 className="text-4xl font-bold">Ajah apartemnts for sale</h1>
				<div className="flex items-center gap-4">
					<div>
						{currentSlide > 0 && (
							<button
								onClick={prevSlide}
								className=" w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors z-10"
								aria-label="Previous property"
							>
								<FaAngleLeft className="text-lg md:text-xl" />
							</button>
						)}
					</div>
					<div>
						{currentSlide < totalSlides - 1 && (
							<button
								onClick={nextSlide}
								className=" w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors z-10"
								aria-label="Next property"
							>
								<FaAngleRight className="text-lg md:text-xl" />
							</button>
						)}
					</div>
				</div>	
			</div>
			
			{/* property cards */}
			<div className="relative">
				{/* Indicator - subtle visual cue */}
				{isMobile && (
					<div className="text-center text-xs text-gray-500 mb-2">
						Swipe to view more
					</div>
				)}
				
				<div className={`grid grid-cols-1 ${propertiesPerSlide >= 2 ? 'sm:grid-cols-2' : ''} ${propertiesPerSlide >= 3 ? 'md:grid-cols-3' : ''} ${propertiesPerSlide >= 4 ? 'lg:grid-cols-4' : ''} gap-4 md:gap-6 mb-6`}>
					{visibleProperties.map((property, idx) => {
						const propertyIndex = startIndex + idx;
						return (
							<div key={propertyIndex} className="relative bg-white w-full rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-shadow duration-300 overflow-hidden">
								{/* Image container */}
								<div className="relative h-48 sm:h-56">
									<img src={property.image} className="w-full h-full object-cover" loading="lazy" />
								</div>
								
								{/* Property details */}
									<div className="mx-4 relative top-[-40px] p-4 flex border-2 border-blue-500 bg-white rounded-xl shadow-[4px_4px_10px_rgba(0,0,0,0.15)]">
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
				
				{/* Mobile-optimized navigation buttons */}
				
			</div>


		</div>
	)
}

export default Ajah