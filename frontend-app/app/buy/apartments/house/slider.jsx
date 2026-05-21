"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useState, useEffect } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaAngleRight } from 'react-icons/fa';
import { FaAngleLeft } from 'react-icons/fa';
import { FaLocationDot } from "react-icons/fa6";
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
/* import { property } from "zod"; */

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


const sliderImages = [
	{
		image: "/assets/property_1.jpg"
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
						<div className="bg-green-300 rounded-md text-center w-20 text-green-700">For sale</div>
						<p className="text-md font-bold">N1,000,000</p>
						<div className="flex gap-1 items-center">
							<FaLocationDot className="text-gray-700" />
							<p className="text-gray-400">Ajah, Lagos</p>
						</div>
						<div className="flex justify-between border-t border-gray-100 sm:p-4 p-2">
							<div className="flex flex-row items-center gap-1">
								<TbRuler3 className="text-gray-400 text-lg" />
								<span className="font-bold text-gray-400 text-xs sm:text-sm">1634</span><p className="text-gray-400">sqft</p>
							</div>
						
							<div className="flex flex-row items-center gap-1">
								<IoBedOutline className="text-gray-400 text-lg" />
								<span className="font-bold text-gray-400 text-xs sm:text-sm">2</span><p className="text-gray-400">bed</p>
							</div>
						
							<div className="flex flex-row items-center gap-1">
								<MdOutlineShower className="text-gray-400 text-lg" />
								<span className="font-bold text-gray-400 text-xs sm:text-sm">3</span><p className="text-gray-400">bath</p>
							</div>
						</div>
					</div>
					{/* buttom */}
					<div className="border-1 border-gray-200 rounded-md px-4 py-6">
						<p className="text-black uppercase font-bold mb-2 text-sm">About this apartment</p>
						<p className="text-sm text-gray-400 leading-normal">Discover luxury living in this beautiful designed 2-bedroom apartment
							located in the heart of Ajah, Lagos. This modern residence features
							contemporary finishes, spacious roos, and is situated in a secure,
							gated estate with 24/7 security. Perfect for families or professionals
							seeking cofort and convenience.
						</p>
						<p className="text-sm text-gray-400 leading-normal">The apartment boast an aopen plan living and dining area with abudant
							natural light, a fully fitted kitchen with quality cabinets and granite 
							counter tops, and en-suite bathrooms with modern fixtures. Located in 
							aprime area with easy access to leki-Epe Expressway, major shopping 
							centers, schools, and hospitals.
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
							<Button className="w-full">
								<Link href="/"> Start an Offer</Link>
							</Button>
							<Button className="w-full bg-transparent border-2 hover:bg-transparent flex items-center">
								<IoCallOutline className="text-black"/>
								<Link href="/" className="text-black"> Call agent</Link>
							</Button>
							<Button className="w-full bg-transparent border-2 hover:bg-transparent flex items-center">
								<FaRegMessage className="text-black"/>
								<Link href="/" className="text-black"> Send Message</Link>
							</Button>
							<Button className="w-full bg-transparent border-2 hover:bg-transparent flex items-center">
								<SlCalender className="text-black"/>
								<Link href="/" className="text-black"> Schedule Inspection</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* key features and estate amenities */}
			<div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
				{/* key features */}
				<div className="px-3 py-6 border-1 rounded-md border-gray-200">
					<p className="font-bold text-black text-md uppercase">key features</p>
					<div className="flex gap-6 py-4">
						<div className="flex gap-4 flex-col">
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Spacious living room</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Pop celling & tiled floors</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Prepaid meter installed</p>
							</div>
						</div>
						<div className="flex gap-4 flex-col">
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Fitted kitchen with cabinet</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Master bedroom with wlak-in closet</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Water heater in the bathrooms</p>
							</div>
						</div>
					</div>
				</div>
				{/* esate amenities */}
				<div className="px-3 py-6 border-1 rounded-md border-gray-200">
					<p className="font-bold text-black text-md uppercase">estate amenities</p>
					<div className="flex gap-6 py-4">
						<div className="flex gap-4 flex-col">
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>24/7 Security</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Gym & fitness center</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Backup generator</p>
							</div>
						</div>
						<div className="flex gap-4 flex-col">
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>CCTV</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Children's playground</p>
							</div>
							<div className="flex gap-2 items-center">
								<IoMdCheckmarkCircleOutline className="bg-green-200 rounded-md text-green-700 border-red-400 text-4xl px-2 py-2" />
								<p>Parking space</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Property details and property stats */}
			<div className="pt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 mb-10">
				{/* property details */}
				<div className="border-2 border-gray-200 rounded-md px-4 py-6">
					<p className="font-bold uppercase pb-3">Propery details</p>
					<div>
						<div className="flex justify-between items-center">
						<p className="text-gray-400 capitalize">Property Type</p>
						<p>Apartment</p>
					</div>
					<div className="flex justify-between items-center">
						<p className="text-gray-400 capitalize">Property ID</p>
						<p>HB-AJ-1234</p>
					</div>
					<div className="flex justify-between items-center">
						<p className="text-gray-400 capitalize">Year Built</p>
						<p>2025</p>
					</div>
					<div className="flex justify-between items-center">
						<p className="text-gray-400 capitalize">Furnishing</p>
						<p>Furnished</p>
					</div>
					<div className="flex justify-between items-center">
						<p className="text-gray-400 capitalize">Service Charge</p>
						<p>N100,000/year</p>
					</div>
					<div className="flex justify-between items-center">
						<p className="text-gray-400 capitalize">Payment Plan</p>
						<p>Available</p>
					</div>	
					</div>
				</div>
				
				{/* Property stats */}
				<div className="border-2 border-gray-200 rounded-md px-4 py-6">
					<p className="font-bold uppercase pb-3">property stats</p>
					<div>
						<div className="flex justify-between items-center">
						<p className="text-gray-400 capitalize">Listed</p>
						<p>2 weeks ago</p>
					</div>
					<div className="flex justify-between items-center">
						<p className="text-gray-400 capitalize">Views</p>
						<p>100 times</p>
					</div>
					<div className="flex justify-between items-center">
						<p className="text-gray-400 capitalize">Inquries</p>
						<p>5 interested</p>
					</div>
					</div>
				</div>
			</div>

			{/* Nearby apartment */}
			<div className="relative border-1 border-gray-200 mb-10 px-8 rounded-md">
				<h1 className="uppercase font-bold text-black my-5 text-xl">Nearby Apartment</h1>
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
				<h1 className="my-10 text-xl font-bold text-black">see all 20 ajah apartments for sales</h1>
			</div>
    </div>
  )
}

export default Slider