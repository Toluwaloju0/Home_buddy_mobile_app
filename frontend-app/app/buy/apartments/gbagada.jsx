"use client";

import Link from "next/link";

import { useState, useEffect, useRef } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaAngleRight } from 'react-icons/fa';
import { FaAngleLeft } from 'react-icons/fa';
import { TbRuler3 } from "react-icons/tb";
import { IoBedOutline } from "react-icons/io5";
import { MdOutlineShower } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";

const properties = [
  {
    image: "../assets/property_3.jpg",
    title: "Island View Apartment",
    price: "₦1,000,000",
    location: "Lekki Phase 1, Lagos",
    size: "1634 sqft",
    beds: "4 bed",
    baths: "3 bath",
  },
  {
    image: "../assets/property_2.png",
    title: "Mainland Comfort Flat",
    price: "₦1,000,000",
    location: "Yaba, Lagos",
    size: "1634 sqft",
    beds: "3 beds",
    baths: "3 bath",
  },
  {
    image: "../assets/property_6.jpg",
    title: "Epe Luxury Apartment",
    price: "₦1,000,000",
    location: "Victoria Island, Lagos",
    size: "1634 sqft",
    beds: "2 beds",
    baths: "3 bath",
  },
  {
    image: "../assets/property_4.jpg",
    title: "Epe Garden Land",
    price: "₦1,000,000",
    location: "Epe, Lagos",
    size: "1634 sqm",
    beds: "2 beds",
    baths: "3 bath",
  },
  {
    image: "../assets/property_6.jpg",
    title: "Epe Luxury Apartment",
    price: "₦1,000,000",
    location: "Yaba, Lagos",
    size: "1634 sqft",
    beds: "3 beds",
    baths: "3 bath",
  },
  {
    image: "../assets/property_2.png",
    title: "Mainland Comfort Flat",
    price: "₦1,000,000",
    location: "Lekki Phase 1, Lagos",
    size: "1634 sqft",
    beds: "4 bed",
    baths: "3 bath",
  },
  {
    image: "../assets/property_3.jpg",
    title: "Island View Apartment",
    price: "₦1,000,000",
    location: "Lekki Phase 1, Lagos",
    size: "1634 sqft",
    beds: "4 bed",
    baths: "3 bath",
  },
  {
    image: "../assets/property_4.jpg",
    title: "Epe Garden Land",
    price: "₦1,000,000",
    location: "Epe, Lagos",
    size: "1634 sqm",
    beds: "2 beds",
    baths: "3 bath",
  },
];

const Gbagada = () => {
  const [favorites, setFavorites] = useState(
    Array(properties.length).fill(false)
  );
  const [propertiesPerSlide, setPropertiesPerSlide] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Create extended array for infinite scrolling effect
  const extendedProperties = [...properties, ...properties, ...properties];
  
  // Track actual index in the extended array
  const [actualIndex, setActualIndex] = useState(properties.length);
  
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
      
      // Reset to middle section on resize
      setActualIndex(properties.length);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate total properties and slides
  const totalProperties = properties.length;
  const totalSlides = Math.ceil(totalProperties / propertiesPerSlide);
  
  // Infinite next slide function
  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setActualIndex(prev => prev + propertiesPerSlide);
    
    // Reset to middle section if we're getting close to the end
    if (actualIndex >= 2 * totalProperties) {
      setTimeout(() => {
        setActualIndex(properties.length);
        setIsTransitioning(false);
      }, 300);
    } else {
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Infinite previous slide function
  const prevSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setActualIndex(prev => prev - propertiesPerSlide);
    
    // Reset to middle section if we're getting close to the beginning
    if (actualIndex <= propertiesPerSlide) {
      setTimeout(() => {
        setActualIndex(properties.length);
        setIsTransitioning(false);
      }, 300);
    } else {
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const toggleFavorite = (i) => {
    setFavorites((prev) => {
      const updated = [...prev];
      updated[i] = !updated[i];
      return updated;
    });
  };

  // Calculate visible properties based on actualIndex
  const startIndex = actualIndex;
  const visibleProperties = extendedProperties.slice(
    startIndex, 
    startIndex + propertiesPerSlide
  );
  
  // Calculate display slide number for UI (1-based, cyclic)
  const displaySlide = ((actualIndex - properties.length) / propertiesPerSlide) % totalSlides;
  const currentSlideNumber = displaySlide < 0 ? totalSlides + displaySlide : displaySlide;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Gbagada apartments for sale</h1>
        </div>
        <div className="flex items-center gap-4 self-end sm:self-center">
          {/* Previous button */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous property"
          >
            <FaAngleLeft className="text-lg md:text-xl" />
          </button>
          
          {/* Next button */}
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next property"
          >
            <FaAngleRight className="text-lg md:text-xl" />
          </button>
        </div>  
      </div>
      
      {/* property cards */}
      <div className="relative mb-10">
        <div 
          className={`grid grid-cols-1 ${propertiesPerSlide >= 2 ? 'sm:grid-cols-2' : ''} ${propertiesPerSlide >= 3 ? 'md:grid-cols-3' : ''} ${propertiesPerSlide >= 4 ? 'lg:grid-cols-4' : ''} gap-4 md:gap-6 mb-6 transition-opacity duration-300 ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
        >
          {visibleProperties.map((property, idx) => {
            const originalIndex = (startIndex + idx) % totalProperties;
            
            return (
              <Link href="/buy/apartments/house" 
                key={`${originalIndex}-${startIndex}`} 
                className="relative bg-white w-full rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 overflow-hidden hover:-translate-y-1"
              >
                {/* Image container */}
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img 
                    src={property.image} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                    loading="lazy" 
                    alt={property.title}
                  />
                </div>
                
                {/* Property details */}
                <div className="mx-4 relative top-[-40px] p-4 flex border-2 bg-white rounded-xl shadow-[4px_4px_10px_rgba(0,0,0,0.15)]">
                  <div className="w-full">
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(originalIndex);
                    }}
                    className="absolute top-3 right-4 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    {favorites[originalIndex] ? (
                      <FaHeart className="text-lg sm:text-xl text-red-500" />
                    ) : (
                      <FaRegHeart className="text-lg sm:text-xl text-gray-600 hover:text-red-500" />
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
              </Link>
            );
          })}
        </div>
      </div>
				<div className="mb-10">
						<p className="font-bold sm:text-xl">See all 20 Gbagada apartments for sale</p>
				</div>
    </div>
  )
}

export default Gbagada;