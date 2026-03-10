"use client";
import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaAngleRight } from 'react-icons/fa'; // From Feather Icons
import { FaAngleLeft } from 'react-icons/fa'; // From Feather Icons
import { TbRuler3 } from "react-icons/tb";
import { IoBedOutline } from "react-icons/io5";
import { MdOutlineShower } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";

import { Button } from "./ui/button";

const categories = ["For Sale", "For Rent", "Short Lets", "Shops", "Lands"];

const properties = [
    {
        image: "assets/property_1.jpg",
        title: "Lekki Luxury Apartment 1",
        price: "₦1,000,000",
        location: "Lekki Phase 1, Lagos",
        size: "1634 sqft",
        beds: "4 bed",
        baths: "3 bath",
    },
    {
        image: "assets/property_2.png",
        title: "Mainland Comfort Flat 2",
        price: "₦1,000,000",
        location: "Yaba, Lagos",
        size: "1634 sqft",
        beds: "3 beds",
        baths: "3 bath",
    },
    {
        image: "assets/property_3.jpg",
        title: "Island View Apartment 3",
        price: "₦1,000,000",
        location: "Victoria Island, Lagos",
        size: "1634 sqft",
        beds: "2 beds",
        baths: "3 bath",
    },
    {
        image: "assets/property_4.jpg",
        title: "Epe Garden Land 4",
        price: "₦1,000,000",
        location: "Epe, Lagos",
        size: "1634 sqm",
        beds: "...",
        baths: "...",
    },
    {
        image: "assets/property_5.png",
        title: "Mainland Comfort Flat 5",
        price: "₦1,000,000",
        location: "Yaba, Lagos",
        size: "1634 sqft",
        beds: "3 beds",
        baths: "3 bath",
    },
    {
        image: "assets/property_6.jpg",
        title: "Lekki Luxury Apartment 6",
        price: "₦1,000,000",
        location: "Lekki Phase 1, Lagos",
        size: "1634 sqft",
        beds: "4 bed",
        baths: "3 bath",
    },
    {
        image: "assets/property_7.jpg",
        title: "Epe Garden Land 7",
        price: "₦1,000,000",
        location: "Epe, Lagos",
        size: "1634 sqm",
        beds: "...",
        baths: "...",
    },
    {
        image: "assets/property_8.jpg",
        title: "Island View Apartment 8",
        price: "₦1,000,000",
        location: "Victoria Island, Lagos",
        size: "1634 sqft",
        beds: "2 beds",
        baths: "3 bath",
    },
];

const FeaturedProperties = () => {
    const [activeTab, setActiveTab] = useState("For Sale");
    const [currentSlide, setCurrentSlide] = useState(0);
    
    const [favorites, setFavorites] = useState(
        Array(properties.length).fill(false)
    );

    const [propertiesPerSlide, setPropertiesPerSlide] = useState(4);
    const [gridCols, setGridCols] = useState("grid-cols-1 md:grid-cols-2 lg:grid-cols-4");

    // Detect screen size and set properties per slide
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            
            if (width < 640) {
                // Mobile: < 640px
                setPropertiesPerSlide(1);
                setGridCols("grid-cols-1");
            } else if (width >= 769 && width <= 960) {
                // Tablet: 769px - 960px
                setPropertiesPerSlide(2);
                setGridCols("grid-cols-2");
            } else if (width >= 960 && width < 1190) {
                // Desktop: 960px - 1190px
                setPropertiesPerSlide(3);
                setGridCols("grid-cols-3");
            } else {
                // Desktop: > 1200px
                setPropertiesPerSlide(4);
                setGridCols("grid-cols-1 md:grid-cols-3 lg:grid-cols-4");
            }
            
            // Reset to first slide when changing viewport
            setCurrentSlide(0);
        };

        // Initial check
        handleResize();

        // Add event listener
        window.addEventListener("resize", handleResize);
        
        // Cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Calculate total slides based on moving by 1 property at a time
    const totalSlides = properties.length - propertiesPerSlide + 1;

    const nextSlide = () => {
        setCurrentSlide((prev) => {
            // Move by 1 property, not by a full slide
            const next = prev + 1;
            // Don't go beyond the last possible starting position
            return next < totalSlides ? next : prev;
        });
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => {
            // Move back by 1 property, not by a full slide
            const prevSlideIndex = prev - 1;
            // Don't go below 0
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

    // Calculate which properties to show - now moves by 1 property at a time
    const startIndex = currentSlide;
    const visibleProperties = properties.slice(startIndex, startIndex + propertiesPerSlide);

    // Calculate number of dots based on the new sliding logic
    const numberOfDots = Math.min(totalSlides, 4); // Show max 4 dots

    return (
        <section className="container mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-5 lg:mb-10">Featured Properties</h2>
            
            {/* Tabs */}
            <div className="flex gap-8 mb-8">
                {categories.map((category, catIndex) =>{
                    return (
                        <button key={catIndex} className={`pb-2 ${activeTab === category ? "text-black font-semibold border-b-2 border-black" : "text-gray-400 "}`} onClick={() => setActiveTab(category)}>{category}</button>
                    )
                })}
            </div>

            {/* Slider Row */}
            <div className="relative">
                <div className={`grid ${gridCols} gap-6 md:gap-4 mb-8 justify-items-center border-2 border-red-500 mb-8`}>
                    {visibleProperties.map((property, idx) => {
                        const propertyIndex = startIndex + idx;
                        return (
                            <div key={propertyIndex} className="relative bg-white w-full max-w-[320px] mx-auto w-[320px] lg:w-[320px] rounded-xl shadow-[4px_4px_10px_rgba(0,0,0,0.15)] overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 border-green-500">
                                <div className="relative h-64">
																	<img src={property.image} className="w-full h-50 object-cover"/>
                                </div>
                                
                                <div className="p-6 md:p-4 border-2 border-blue-500 absolute w-[90%] -translate-x-1/2 top-36 left-1/2 bg-white rounded-xl flex justify-between shadow-[4px_4px_10px_rgba(0,0,0,0.15)]">
                                    <div>
                                        <h3 className="font-semibold text-sm text-gray-500">{property.title}</h3>
                                        <p className="font-bold mt-2 flex items-center text-sm">{property.price}</p>
                                        <div className="flex items-center border-2 border-blue-400 mt-2 gap-1">
                                            <CiLocationOn />
                                            <p className="text-gray-500 text-sm">{property.location}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleFavorite(propertyIndex)}
                                        className="ww-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                    >
                                        {favorites[propertyIndex] ? (
                                            <FaHeart className="text-2xl text-red-500" />
                                        ) : (
                                            <FaRegHeart className="text-2xl text-gray-600" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex justify-between text-sm mt-4 p-2 lg:p-4">
                                    <div className="text-center flex items-center gap-1 ">
																			<TbRuler3 className="text-gray-400 text-xl"  />
																			<p className="font-semibold text-gray-700 md:text-sm">{property.size}</p>
                                    </div>
                                    <div className="text-center flex items-center gap-1">
																			<IoBedOutline className="text-gray-400 text-xl"/>
																			<p className="font-semibold text-gray-700 md:text-sm">{property.beds}</p>
                                    </div>
                                    <div className="text-center flex items-center gap-1">
																			<MdOutlineShower className="text-gray-400 text-xl"/>
																			<p className="font-semibold text-gray-700 md:text-sm">{property.baths}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Navigation Buttons - Only show if there are more slides */}
                {currentSlide > 0 && (
                    <button
                        onClick={prevSlide}
                        className="absolute left-[40px] top-70px -translate-y-1/2 -translate-x-4 md:-translate-x-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                        <FaAngleLeft className="text-xl md:text-2xl" />
                    </button>
                )}

                {currentSlide < totalSlides - 1 && (
                    <button
                        onClick={nextSlide}
                        className="absolute right-[40px] top-70px -translate-y-1/2 translate-x-4 md:translate-x-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                        <FaAngleRight className="text-xl md:text-2xl" />
                    </button>
                )}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 gap-3">
                {Array.from({ length: numberOfDots }).map((_, i) => {
                    // Calculate which slide each dot represents when we have limited dots
                    const slideIndex = i < totalSlides ? i : null;
                    
                    return slideIndex !== null ? (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(slideIndex)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                                currentSlide === slideIndex
                                    ? "bg-gray-600"
                                    : "bg-gray-300 hover:bg-gray-400"
                            }`}
                            aria-label={`Go to slide ${slideIndex + 1}`}
                        />
                    ) : null;
                })}
            </div>
                
        </section>
    )
};

export default FeaturedProperties;


{/* <div>
            <div className='container mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-20'>
                <div className='grid grid-cols-2 border-2 min-h-screen place-items-center'>
                    <div>
                        <h1 className='text-2xl font-bold'>We're Here to Help</h1>
                        <p className='text-sm text-gray-300'>Contact our team for support, enquireies, feedback, or partnership opportunites.</p>
                    </div>
                    <div className="sm:h-full sm:w-full sm:px-0 relative h-150 w-150">
                        <Image src="/assets/agent-1.png" alt="" className="object-contain px-5 sm:px-0" fill />
                    </div>
                </div>
            </div>
    </div> */}


    /* <div className="w-[420px]">
          <div
            className="
              relative 
              overflow-hidden
              rounded-3xl
              [clip-path:polygon(5%_0%,100%_0%,100%_100%,0%_100%)]
                        border-2 border-blue-500
            "
          >
            <Image
              src="/assets/contact.jpg" // put image in /public
              alt="Customer support agent"
              width={800}
              height={600}
              className="object-cover"
            />
          </div>
        </div> */


        /* <div className="border-1">
            <p className="text-sm text-gray-300">Fill out the form below and we will get back to you</p>
             <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="What is this regarding?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                    placeholder="Type your message here..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none transition"
                >
                  Send Message
                </button>
              </form>
          </div> */