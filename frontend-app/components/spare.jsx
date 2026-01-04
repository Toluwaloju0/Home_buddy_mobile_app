"use client";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaAngleRight } from 'react-icons/fa'; // From Feather Icons
import { FaAngleLeft } from 'react-icons/fa'; // From Feather Icons
import { Button } from "./ui/button";
 

const categories = ["For Sale", "For Rent", "Short Lets", "Shops", "Lands"];


const properties = [
    {
        image: "assets/property_1.jpg",
        title: "Lekki Luxury Apartment",
        price: "₦1,000,000",
        location: "Lekki Phase 1, Lagos",
        size: "1634 sqft",
        beds: "4 bed",
        baths: "3 bath",
    },
    {
        image: "assets/property_2.png",
        title: "Mainland Comfort Flat",
        price: "₦1,000,000",
        location: "Yaba, Lagos",
        size: "1634 sqft",
        beds: "3 beds",
        baths: "3 bath",
    },
    {
        image: "assets/property_3.jpg",
        title: "Island View Apartment",
        price: "₦1,000,000",
        location: "Victoria Island, Lagos",
        size: "1634 sqft",
        beds: "2 beds",
        baths: "3 bath",
    },
    {
        image: "assets/property_4.jpg",
        title: "Epe Garden Land",
        price: "₦1,000,000",
        location: "Epe, Lagos",
        size: "1634 sqm",
        beds: "...",
        baths: "...",
    },
    {
        image: "assets/property_5.png",
        title: "Mainland Comfort Flat",
        price: "₦1,000,000",
        location: "Yaba, Lagos",
        size: "1634 sqft",
        beds: "3 beds",
        baths: "3 bath",
    },
    {
        image: "assets/property_6.jpg",
        title: "Lekki Luxury Apartment",
        price: "₦1,000,000",
        location: "Lekki Phase 1, Lagos",
        size: "1634 sqft",
        beds: "4 bed",
        baths: "3 bath",
    },
    {
        image: "assets/property_7.jpg",
        title: "Epe Garden Land",
        price: "₦1,000,000",
        location: "Epe, Lagos",
        size: "1634 sqm",
        beds: "...",
        baths: "...",
    },
    {
        image: "assets/property_8.jpg",
        title: "Island View Apartment",
        price: "₦1,000,000",
        location: "Victoria Island, Lagos",
        size: "1634 sqft",
        beds: "2 beds",
        baths: "3 bath",
    },
];

const FeaturedProperties = () => {
    
    const [activeTab, setActiveTab] = useState("For Sale");
    const [index, setIndex] =  useState(0);
    const next = () => setIndex((prev) => (prev + 1) % properties.length);
    const prev = () => setIndex((prev) => prev === 0 ? properties.length - 1 : prev - 1);

    const [currentSlide, setCurrentSlide] = useState(0);
    
    const [favorites, setFavorites] = useState(
  Array(properties.length).fill(false)
    );

    

    const toggleFavorite = (i) => {
        setFavorites((prev) => {
            const updated = [...prev];
            updated[i] = !updated[i];
            return updated;
        });
    };

    
    
    return (
        <section className="container mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-10">Featured Properties</h2>
            
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {properties.map((property, idx) => (
                        <div key={idx} className={`transition-all duration-500 ${idx === index ? "opacity-100" : "opacity-60"}  border-2 border-black`}>
                            <div className="bg-white rounded-xl shadow-md overflow-hidden relative w-[-320px]">
                                <img src={property.image} className="w-full h-48 object-cover"/>
                                <div className="p-6 border-2 border-green-400 flex">
                                    <div className="absolute bg-white -translate-x-1/2 w-[90%] top-36 left-1/2 p-4 rounded-xl shadow-md overflow-hidden border-2 border-red-500">
                                        <h3 className="font-semibold text-sm text-gray-500">{property.title}</h3>
                                        <p className="font-bold mt-2 flex items-center text-sm">{property.price}</p>
                                        <p className="text-gray-500 text-sm flex items-center mt-2">{property.location}</p>
                                         <Button
                                                variant="ghost"
                                                onClick={() => toggleFavorite(idx)}
                                                className="absolute right-2 top-3 z-20">
                                                {favorites[idx] ? (
                                                    <FaHeart className="text-2xl text-red-500" />
                                                ) : (
                                                    <FaRegHeart className="text-2xl text-black" />
                                                )}
                                            </Button>	
                                    </div>
                                    
                                </div>
                                <div className="flex justify-between text-sm mt-4">
                                    <div>
                                        <span>{property.size}</span>
                                    </div>
                                    <div>
                                        <span>{property.beds}</span>
                                    </div>
                                    <div>
                                        <span>{property.baths}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button onClick={prev} 
                className="absolute -left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                    <FaAngleLeft className="text-2xl" />
                </button>

                <button onClick={next} className="absolute -right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                    <FaAngleRight className="text-2xl" />
                </button>
            </div>

            {/* DOTS */}
      <div className="flex justify-center mt-6 gap-3">
        {properties.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              index === i ? "bg-gray-700" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>
        </section>
    )

};

export default FeaturedProperties;



/* "use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

import { MdOutlineMarkEmailUnread } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa";

const links = [
    {
        name: "buy",
        path: "/buy",
    },
    {
        name: "rent",
        path: "/rent",
    },
    {
        name: "sell",
        path: "/sell",
    },
    {
        name: "agent",
        path: "/agent",
    },
    {
        name: "facility mgt",
        path: "/facility mgt",
    },
]

const Nav = () => {
    const pathname = usePathname();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
        <div className="flex gap-4 items-center">
            <nav className="flex gap-8">
                {links.map((link, index) => {
                    return (
                        <Link href={link.path} key={index} className="capitalize">
                            {link.name}
                        </Link>
                    )
                })}
            </nav>
            
            
            {isLoggedIn ? (
                <div className="relative">
                    <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <MdOutlineMarkEmailUnread className="text-xl text-gray-800"/>
                            </Link>
                            <div className="flex items-center gap-2">
                                <span>Chika</span>
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <img src="assets/agent-1.png" className="rounded-full" />
                                </div> 
                                <FaAngleDown className="text-xl text-gray-400"/>
                            </div>
                        </div>
                    </button>
                    
                    
                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border p-4 z-50">
                            <div className="space-y-3">
                                <Link 
                                    href="/dashboard" 
                                    className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors block"
                                >
                                    <span>Dashboard</span>
                                </Link>
                                <Link 
                                    href="/messages" 
                                    className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors block"
                                >
                                    <span>Messages</span>
                                </Link>
                                <button className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors w-full text-left">
                                    <span>Switch to Buyer/Renter Mode</span>
                                </button>
                                <div className="border-t pt-3">
                                    <button 
                                        onClick={() => setIsLoggedIn(false)}
                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                                    >
                                        <span>Log out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    
                    <Link href="/join">
                        <Button className="px-6 py-6">Join / Sign in</Button>
                    </Link>
                </div>
            )}
        </div>
  )
}

export default Nav; */