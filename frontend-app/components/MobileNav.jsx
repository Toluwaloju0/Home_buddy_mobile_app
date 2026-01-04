/* "use client";
import { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FaBars } from "react-icons/fa";
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
    path: "/facility-mgt", // Fixed: changed space to hyphen for valid URL
  },
]

const MobileNav = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <Sheet>
      <SheetTrigger className="flex justify-center items-center">
        <FaBars className="text-2xl cursor-pointer text-gray-700" />
      </SheetTrigger>
      <SheetContent className="flex flex-col p-8 w-full sm:max-w-md">
        
        <nav className='flex flex-col items-start justify-start gap-6 flex-1'>
          {links.map((link, index) => {
            return (
              <Link 
                href={link.path} 
                key={index} 
                className={`${link.path === pathname ? 'text-accent border-accent border-b-2' : 'text-gray-700'} text-lg capitalize hover:text-gray-100 transition-all w-full py-2`}
                onClick={() => document.querySelector('[data-state="open"]')?.click()}
              >
                {link.name}  
              </Link>
            )
          })}
        </nav>
        
        <div className="border-t pt-6 mt-6">
          {isLoggedIn ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    <img 
                      src="/assets/agent-1.png" 
                      alt="User avatar" 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.backgroundColor = '#f3f4f6';
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">John Doe</span>
                    <span className="text-xs text-gray-500">Premium Member</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="relative p-2 hover:bg-gray-100 rounded-full">
                    <MdOutlineMarkEmailUnread className="text-xl text-gray-800" />
                  </button>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`p-2 hover:bg-gray-100 rounded-full transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  >
                    <FaAngleDown className="text-xl text-gray-400" />
                  </button>
                </div>
              </div>

              {showUserMenu && (
                <div className="flex flex-col gap-2 pl-14">
                  <Link 
                    href="/profile" 
                    className="text-gray-600 hover:text-accent py-2"
                    onClick={() => document.querySelector('[data-state="open"]')?.click()}
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/settings" 
                    className="text-gray-600 hover:text-accent py-2"
                    onClick={() => document.querySelector('[data-state="open"]')?.click()}
                  >
                    Settings
                  </Link>
                  <Link 
                    href="/listings" 
                    className="text-gray-600 hover:text-accent py-2"
                    onClick={() => document.querySelector('[data-state="open"]')?.click()}
                  >
                    My Listings
                  </Link>
                  <button 
                    onClick={() => {
                      setIsLoggedIn(false);
                      setShowUserMenu(false);
                      document.querySelector('[data-state="open"]')?.click();
                    }}
                    className="text-left text-red-600 hover:text-red-800 py-2"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link 
                href="/join" 
                className="w-full"
                onClick={() => document.querySelector('[data-state="open"]')?.click()}
              >
                <Button size="lg" className="w-full">Join Now</Button>
              </Link>
              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link 
                  href="/login" 
                  className="text-accent font-medium hover:underline"
                  onClick={() => document.querySelector('[data-state="open"]')?.click()}
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav; */



"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser } from "@/app/context/UserContext";
import { FaBars } from "react-icons/fa";
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa";

const links = [
  {
    name: "buy",
    path: "/buy",
    subItems: [
      { name: "Apartments", path: "/buy/apartments" },
      { name: "Lands", path: "/buy/lands" },
      { name: "Shops", path: "/buy/shops" },
    ]
  },
  {
    name: "rent",
    path: "/rent",
    subItems: [
      { name: "Apartments", path: "/rent/apartments" },
      { name: "Shared Homes", path: "/rent/sharedhomes" },
      { name: "Shortlets", path: "/rent/shortlets" },
      { name: "Shops", path: "/rent/shops" },
      { name: "List My Property for Rent", path: "/rent/listproperties" },
      { name: "Buyer/Renter Dashboard", path: "/rent/buyorrent" },
    ]
  },
  {
    name: "sell",
    path: "/sell",
    subItems: [
      { name: "Apartments", path: "/sell/apartments" },
      { name: "Lands", path: "/sell/lands" },
      { name: "Shops", path: "/sell/shops" },
      { name: "List My Property for Rent", path: "/sell/list" },
      { name: "Agent/Landlord Dashboard", path: "/sell/agent" },
    ]
  },
  {
    name: "agent",
    path: "/agent",
    subItems: [
      { name: "All Agents", path: "/agent/allagent" },
      { name: "Top Rated Agents", path: "/agent/topagent" },
    ]
  },
  {
    name: "facility mgt",
    path: "/facility mgt",
    subItems: [
      { name: "Maintenance Request", path: "/facilitymgt/maintainance" },
      { name: "Waste Collection", path: "/facilitymgt/waste" },
      { name: "Property Dashboard", path: "/facilitymgt/properties" },
    ]
  },
]

const MobileNav = () => {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  // Extract first part of email for display name
  const getUserDisplayName = () => {
    if (!user?.email) return "User";
    return user.email.split('@')[0];
  };

  const getUserRoleDisplay = () => {
    if (!user?.role) return "Guest";
    return user.role === 'agent' ? 'Agent/Landlord' : 'Buyer/Renter';
  };

  const handleCloseSheet = () => {
    document.querySelector('[data-state="open"]')?.click();
  };

  const toggleMenu = (index) => {
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  return (
    <Sheet>
      <SheetTrigger className="flex justify-center items-center">
        <FaBars className="text-2xl cursor-pointer text-gray-700" />
      </SheetTrigger>
      <SheetContent className="flex flex-col p-4 w-full sm:max-w-md overflow-y-auto">
        {/* Navigation Links with Dropdowns */}
        <nav className='flex flex-col items-start justify-start gap-2 flex-1'>
          {links.map((link, index) => (
            <div key={index} className="w-full">
              {/* Main Menu Item */}
              <div className="flex items-center justify-between w-full py-3">
                <Link 
                  href={link.path} 
                  className={`${link.path === pathname ? 'text-accent border-accent border-b-2' : 'text-gray-700'} text-lg capitalize hover:text-gray-900 transition-all`}
                  onClick={handleCloseSheet}
                >
                  {link.name}  
                </Link>
                
                {/* Dropdown Toggle Button */}
                {link.subItems && link.subItems.length > 0 && (
                  <button
                    onClick={() => toggleMenu(index)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-transform"
                  >
                    <FaAngleDown className={`text-lg text-gray-400 transition-transform ${expandedMenu === index ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              
              {/* Submenu Items */}
              {expandedMenu === index && link.subItems && (
                <div className="ml-4 pl-2 border-l-2 border-gray-200 mb-2">
                  {link.subItems.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      href={subItem.path}
                      className={`block py-3 text-gray-600 hover:text-accent transition-colors ${
                        subItem.highlight ? 'text-primary font-semibold' : ''
                      }`}
                      onClick={handleCloseSheet}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                  
                  {/* Special items based on user role - similar to desktop */}
                  {link.name === "sell" && user?.role === "agent" && (
                    <Link
                      href="/agent/dashboard"
                      className="block py-3 text-primary font-semibold hover:text-accent transition-colors"
                      onClick={handleCloseSheet}
                    >
                      Agent/Landlord Dashboard
                    </Link>
                  )}
                  
                  {link.name === "rent" && user?.role === "buyer" && (
                    <Link
                      href="/buyer/dashboard"
                      className="block py-3 text-primary font-semibold hover:text-accent transition-colors"
                      onClick={handleCloseSheet}
                    >
                      Buyer/Renter Dashboard
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Authentication Section */}
        <div className="border-t pt-4 mt-3">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    <img 
                      src={user.avatar || "/assets/agent-1.png"} 
                      alt="User avatar" 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.backgroundColor = '#f3f4f6';
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{getUserDisplayName()}</span>
                    <span className="text-xs text-gray-500">{getUserRoleDisplay()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/messages" onClick={handleCloseSheet}>
                    <button className="relative p-2 hover:bg-gray-100 rounded-full">
                      <MdOutlineMarkEmailUnread className="text-xl text-gray-800" />
                    </button>
                  </Link>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`p-2 hover:bg-gray-100 rounded-full transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  >
                    <FaAngleDown className="text-xl text-gray-400" />
                  </button>
                </div>
              </div>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="flex flex-col gap-3 pl-14 border-t pt-4 mt-2">
                  <div className="pb-2 border-b">
                    <div className="text-sm font-medium">{user.email}</div>
                  </div>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-accent py-2"
                    onClick={handleCloseSheet}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/messages" 
                    className="text-gray-600 hover:text-accent py-2"
                    onClick={handleCloseSheet}
                  >
                    Messages
                  </Link>
                  <button 
                    onClick={handleCloseSheet}
                    className="text-left text-gray-600 hover:text-accent py-2"
                  >
                    Switch to {user.role === 'agent' ? 'Buyer/Renter' : 'Agent/Landlord'} Mode
                  </button>
                  <button 
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      handleCloseSheet();
                    }}
                    className="text-left text-red-600 hover:text-red-800 py-2 mt-2 pt-2 border-t"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Link 
                href="/join" 
                className="w-full"
                onClick={handleCloseSheet}
              >
                <Button size="lg" className="w-full">Join / Sign in</Button>
              </Link>
              <div className="text-center text-sm">
                <span className="text-gray-600">Start your property journey with us</span>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav;