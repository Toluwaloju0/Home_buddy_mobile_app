"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useState, useEffect } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaAngleRight } from 'react-icons/fa';
import { FaAngleLeft } from 'react-icons/fa';
import { FaLocationDot } from "react-icons/fa6";
import { GoPeople } from "react-icons/go";
import { TbRuler3 } from "react-icons/tb";
import { IoBedOutline } from "react-icons/io5";
import { MdOutlineShower } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import { VscVerifiedFilled } from "react-icons/vsc";
import { IoCallOutline } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import { FaCar } from "react-icons/fa";
/* import { property } from "zod"; */

const properties = [
{
		image: "/assets/property_3.jpg",
		title: "Premium Studio Shortlet",
		price: "₦35,000/night",
		location: "Lekki Phase 1, Lagos",
		beds: "1 studio bed",
		baths: "3 bath",
		guests: "1 guest",
	},
	{
		image: "/assets/property_2.png",
		title: "2-Bedroom Shortlet",
		price: "₦25,000/night",
		location: "Lekki Phase 1, Lagos",
		beds: "2 bed",
		baths: "2 bath",
		guests: "1 guest",
	},
	{
		image: "/assets/property_6.jpg",
		title: "3-Bedroom Penthouse",
		price: "₦50,000/night",
		location: "Lekki Phase 1, Lagos",
		beds: "3 bed",
		baths: "3 bath",
		guests: "4 guest",
	},
	{
		image: "/assets/property_4.jpg",
		title: "Cozy 1-Bed Shortlet",
		price: "₦45,000/night",
		location: "Lekki Phase 1, Lagos",
		beds: "1 bed",
		baths: "3 bath",
		guests: "1 guest",
	},
	{
		image: "/assets/property_6.jpg",
		title: "Executive",
		price: "₦60,000/night",
		location: "Lekki Phase 1, Lagos",
		beds: "3 bed",
		baths: "2 bath",
		guests: "1 guest",
	},
	{
		image: "/assets/property_2.png",
		title: "Cozy 1-Bed Shortlet",
		price: "₦45,000/night",
		location: "Lekki Phase 1, Lagos",
		beds: "1 bed",
		baths: "3 bath",
		guests: "1 guest",
	},
	{
		image: "/assets/property_3.jpg",
		title: "3-Bedroom Penthouse",
		price: "₦50,000/night",
		location: "Lekki Phase 1, Lagos",
		beds: "3 bed",
		baths: "3 bath",
		guests: "4 guest",
	},
	{
		image: "/assets/property_4.jpg",
		title: "2-Bedroom Shortlet",
		price: "₦25,000/night",
		location: "Lekki Phase 1, Lagos",
		beds: "2 bed",
		baths: "2 bath",
		guests: "1 guest",
	},
];


const sliderImages = [
	{
		image: "/assets/property_4.jpg"
	},
	{
		image: "/assets/ajah-1.png"
	},
	{
		image: "/assets/ajah-2.png"
	},
	{
		image: "/assets/ajah-3.png"
	},
	{
		image: "/assets/ajah-4.png"
	},
	{
		image: "/assets/ajah-5.png"
	},
	{
		image: "/assets/ajah-6.png"
	},
	{
		image: "/assets/ajah-7.png"
	},
	{
		image: "/assets/ajah-8.png"
	},
	{
		image: "/assets/ajah-9.png"
	},
	{
		image: "/assets/ajah-10.jpg"
	},

]

const Slider = () => {

	const [currentSlide, setCurrentSlide] = useState(0);
	const [imagePerSlide, setImagePerSlide] = useState(1);
	const [propertiesPerSlide, setpropertiesPerSlide] = useState(1);
	const [isMobile, setIsMobile] = useState(false);
	const [favorites, setFavorites] = useState(
		Array(properties.length).fill(false)
	);

	//Detect screen size
	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			setIsMobile(width < 768);

			if (width < 640){
				setImagePerSlide(1);
				setpropertiesPerSlide(1)
			} else if (width >= 640 && width < 768){
				setImagePerSlide(2);
				setpropertiesPerSlide(2);
			} else if (width >= 768 && width < 1024){
				setImagePerSlide(2);
				setpropertiesPerSlide(2);
			} else if (width >= 1024  && width < 1280){
				setImagePerSlide(3);
				setpropertiesPerSlide(3);
			} else {
				setImagePerSlide(4);
				setpropertiesPerSlide(4);
			}
			setCurrentSlide(0);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const totalSlides = sliderImages.length - imagePerSlide + 1;
	console.log(totalSlides)

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
			console.log(updated)
			updated[i] = !updated[i]
			return updated;
		});
	};

	const startIndex = currentSlide;
	const visibleImage = sliderImages.slice(startIndex, startIndex + imagePerSlide);
	const visibleProperties = properties.slice(startIndex, startIndex + propertiesPerSlide);
	console.log(visibleImage);
	
	
	
	return (
		<div>
			<div className="pb-10">
				<Link href="/buy/apartments" className="flex items-center gap-3 text-xl font-bold">
					<IoMdArrowRoundBack /> Back to Search
				</Link>
			</div>
			{/* Slider */}
			<div className={`relative grid grid-cols-1 ${imagePerSlide >= 2 ? 'sm:grid-cols-2' : ''} ${imagePerSlide >= 3 ? 'md:grid-cols-3' : ''} ${imagePerSlide >= 4 ? 'lg:grid-cols-4' : ''} gap-4 md:gap-6 mb-6 pb-10`}>
				{visibleImage.map((item, index) => {
					const imageIndex = startIndex + index;
					/* console.log(imageIndex); */
					return (
						<div key={imageIndex} className="relative w-full">
							{/* image container */}
							<div className="h-48 sm:h-64 relative">
								<Image src={item.image} fill alt="image" className="object-cover rounded-md"/>
							</div>
						</div>
					)
				})}
				{/* {sliderImages.map((item, index) => {
					return (
						<div key={index} className="h-48 sm:h-64 sm:w-64 border-2 border-red-400">
							<img src={item.image} className="w-full h-full object-cover"/>
						</div>
					)
				})} */}
			</div>

			{/* Mobile-optimized navigation buttons */}
			{currentSlide > 0 && (
				<button
					onClick={prevSlide}
					className="absolute left-30 top-80 -translate-y-1/2 -translate-x-2 md:-translate-x-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors z-10"
					aria-label="Previous property"
				>
					<FaAngleLeft className="text-lg md:text-xl" />
				</button>
			)}

			{currentSlide < totalSlides - 1 && (
				<button
					onClick={nextSlide}
					className="absolute right-30 top-80 -translate-y-1/2 translate-x-2 md:translate-x-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors z-10"
					aria-label="Next property"
				>
					<FaAngleRight className="text-lg md:text-xl" />
				</button>
			)}
			
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
				{/* left side */}
				<div className="flex flex-col gap-4">
					{/* top */}
					<div className="border-1 border-gray-200 rounded-md px-4 py-6">
						<div className="bg-red-300 rounded-md text-center w-20 text-red-700">For rent</div>
						<p className="text-md font-bold">N135,000/night</p>
						<div className="flex gap-1 items-center">
							<FaLocationDot className="text-green-700" />
							<p className="text-gray-400">Lekki Phase 1, Lagos</p>
						</div>
						<div className="flex justify-between border-t border-gray-100 sm:p-4 p-2">
							<div className="flex flex-row items-center gap-1">
								<GoPeople className="text-gray-400 text-lg" />
								<span className="font-bold text-gray-400 text-xs sm:text-sm">1</span><p className="text-gray-400">studio bed</p>
							</div>

							<div className="flex flex-row items-center gap-1">
								<MdOutlineShower className="text-gray-400 text-lg" />
								<span className="font-bold text-gray-400 text-xs sm:text-sm">1</span><p className="text-gray-400">bath</p>
							</div>
						
							<div className="flex flex-row items-center gap-1">
								<GoPeople className="text-gray-400 text-lg" />
								<span className="font-bold text-gray-400 text-xs sm:text-sm">1</span><p className="text-gray-400">guest</p>
							</div>

							<div className="flex flex-row items-center gap-1">
								<TbRuler3 className="text-gray-400 text-lg" />
								<span className="font-bold text-gray-400 text-xs sm:text-sm">55</span><p className="text-gray-400">sqm</p>
							</div>
						</div>
					</div>
					{/* buttom */}
					<div className="border-1 border-gray-200 rounded-md px-4 py-6">
						<p className="text-black uppercase font-bold mb-2 text-sm">About this shortlet</p>
						<p className="text-sm text-gray-400 leading-normal">Stuuning studio apartment with brethtaking views of Leki Phase 1.
							This premium property offers the ultimate luxury exeperience with top-notch amenities
							and services. Ideal for executive or those seeking an upsacle temporary residence in
							Lagos most prestigious neighborhood.
						</p>
					</div>
				</div>

				{/* right side */}
				<div className="border-1 border-gray-200 rounded-md px-4 py-6">

					<div>
						<p className="text-sm font-bold uppercase mb-5">agent</p>
						<div className="mb-6">
							{/* agent information */}
							<div className="flex flex-col sm:flex-row border border-gray-200 rounded-xl sm:rounded-md p-4 w-full">
								{/* Agent Image */}
								<div className="flex justify-center sm:justify-start mb-4 sm:mb-0 sm:mr-4">
									<div className="relative w-24 h-24 sm:w-28 sm:h-28">
										<Image src="/assets/agent-1.png" fill alt="image" className="w-full h-full object-cover rounded-full border-4 border-white shadow-md" />
									</div>
								</div>
								
								{/* Agent Info */}
								<div className="flex-1 text-center sm:text-left">
									<div className="flex items-center gap-1 justify-center sm:justify-start">
										<h3 className="text-lg sm:text-xl font-bold text-gray-800">Chika Nwosu</h3>
										<VscVerifiedFilled className="text-green-900"/>
									</div>
									<p className="text-gray-500 text-sm sm:text-base mb-1">Greenfield Reality</p>
									
									{/* Rating and Reviews */}
									<div className="flex justify-center sm:justify-start items-center gap-2 ">
										<div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
											<p className="text-gray-800 text-sm">4.8</p>
											<FaStar className="text-yellow-400 text-sm" />
										</div>
										<p className="text-gray-600 text-sm font-bold">120 Reviews</p>
									</div>
									
									{/* Stats */}
									<div className="bg-gray-50 px-2 rounded-lg">
										<p className="text-gray-700 text-sm">
											<span>42</span> Properties Listed | 
											<span>31</span> Sold
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* contact buttons */}
						<div className="px-4 flex flex-col gap-3">
							{/* <Button className="w-full">
								<Link href="/"> Start an Offer</Link>
							</Button> */}
							<Button className="w-full flex items-center">
								<SlCalender className="text-white"/>
								<Link href="/" className="text-white"> Book Stay</Link>
							</Button>
							<Button className="w-full bg-transparent border-2 hover:bg-transparent flex items-center">
								<IoCallOutline className="text-black"/>
								<Link href="/" className="text-black"> Call Agent</Link>
							</Button>
							<Button className="w-full bg-transparent border-2 hover:bg-transparent flex items-center">
								<FaRegMessage className="text-black"/>
								<Link href="/" className="text-black"> Schedule Inspection</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* key features */}
			<div className="my-5 grid grid-cols-1 gap-4 ">
				{/* key features */}
				<div className="px-3 py-6 border-1 rounded-md border-gray-200">
					<p className="font-bold text-black text-md uppercase">key features</p>
					<div className=" grid grid-cols-2 gap-8">
						<div className="flex gap-4 flex-col">
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Premium king-size bed</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Work desk with ergonomic chair</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Walk-in rain shower</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>24/7 power with backup generator</p>
							</div>
						</div>
						<div className="flex gap-4 flex-col">
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Open plan studio layout</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Kitchenette with built-in appliances</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Two smart TVs</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>KCentral air conditioning</p>
							</div>
						</div>
					</div>
				</div>
			</div>



			{/* Nearby apartment */}
			<div className="relative border-1 border-gray-200 mb-10 px-8 rounded-md">
				<h1 className="uppercase font-bold text-black my-7 text-xl">Nearby Shortlets</h1>
				<h1 className="font-bold text-black my-5 text-4xl">Lekki shortlets for rent</h1>
				<div className={`grid grid-cols-1 gap-3  ${propertiesPerSlide >= 2 ? 'sm:grid-cols-2' : ''} ${propertiesPerSlide >= 3 ? 'md:grid-cols-3' : ''} ${propertiesPerSlide >= 4 ? 'lg:grid-cols-4' : ''} gap-4 md:gap-6 mb-6`}>
					{visibleProperties.map((property, idx) => {
					const propertyIndex = startIndex + idx;
					return (
						<div key={propertyIndex} className="relative bg-white w-full rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-shadow duration-300 overflow-hidden">
							{/* Image container */}
							<div className="relative h-48 sm:h-56">
								<Image src={property.image} fill alt="image" className="w-full h-full object-cover" loading="lazy" />
							</div>
							
							{/* Property details */}
							<div className="mx-4 relative top-[-40px] p-4 flex border-2 bg-white rounded-xl shadow-[4px_4px_10px_rgba(0,0,0,0.15)]">
								<div className="">
									<div className="mb-3">
										<h3 className="font-semibold text-gray-400 text-base sm:text-md line-clamp-1">
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
										<IoBedOutline className="text-gray-500 text-lg" />
										<span className="font-medium text-gray-700 text-xs sm:text-sm">{property.beds}</span>
									</div>
								
									<div className="flex flex-row items-center gap-1">
										<MdOutlineShower className="text-gray-500 text-lg" />
										<span className="font-medium text-gray-700 text-xs sm:text-sm">{property.baths}</span>
									</div>
								
									<div className="flex flex-row items-center gap-1">
										<GoPeople className="text-gray-500 text-lg" />
										<span className="font-medium text-gray-700 text-xs sm:text-sm">{property.guests}</span>
									</div>
							</div>
					</div>
					);
				})}
				</div>
				{/* Mobile-optimized navigation buttons */}
				{currentSlide > 0 && (
					<button
						onClick={prevSlide}
						className="absolute left-0 top-60 -translate-y-1/2 -translate-x-2 md:-translate-x-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors z-10"
						aria-label="Previous property"
					>
						<FaAngleLeft className="text-lg md:text-xl" />
					</button>
				)}

				{currentSlide < totalSlides - 1 && (
					<button
						onClick={nextSlide}
						className="absolute right-0 top-60 -translate-y-1/2 translate-x-2 md:translate-x-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors z-10"
						aria-label="Next property"
					>
						<FaAngleRight className="text-lg md:text-xl" />
					</button>
				)}
				<h1 className="my-10 text-xl font-bold text-black">see all 11 Lekki shortlets for rent</h1>
			</div>
		</div>
	)
}

export default Slider