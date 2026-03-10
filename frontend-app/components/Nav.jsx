"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { useUser } from "@/app/context/UserContext";
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa";


const links = [
  {
    name: "buy",
    path: "/",
		subItems: [
			{ name: "Apartments", path: "/buy/apartments" },
			{ name: "Lands", path: "/buy/lands" },
			{ name: "Shops", path: "/buy/shops" },
		]
  },
  {
    name: "rent",
    path: "/",
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
    path: "/",
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
    path: "/",
		subItems: [
			{ name: "All Agents", path: "/agent/allagent" },
			{ name: "Top Rated Agents", path: "/agent/topagent" },
		]
  },
  {
    name: "facility mgt",
    path: "/",
		subItems: [
			{ name: "Maintenance Request", path: "/facilitymgt/maintainance" },
			{ name: "Waste Collection", path: "/facilitymgt/waste" },
			{ name: "Property Dashboard", path: "/facilitymgt/properties" },
		]
  },
]

const Nav = () => {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);

	const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);


  // Extract first part of email for display name
  const getUserDisplayName = () => {
    if (!user?.email) return "Chika"; // Fallback to default
    return user.email.split('@')[0];
  };

  const getUserRoleDisplay = () => {
    if (!user?.role) return "";
    return user.role === 'agent' ? 'Agent/Landlord' : 'Buyer/Renter';
  };

	const handleMouseEnter = (index) => {
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
			setHoverTimeout(null);
		}
		setActiveDropdown(index);
	}; 

	const handleMouseLeave = () => {
		const timeout = setTimeout(() => {
			setActiveDropdown(null);
		}, 200); //small delay to allowo moving to dropdown
		setHoverTimeout(timeout);
	};

	const handleDropdownMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

	const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  return (
    <div className="flex gap-4 items-center">
      <nav className="flex gap-8">
        {links.map((link, index) => {
          return (
					<Link href={link.path} key={index} className="relative" onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}>
						<button className="flex items-center gap-1 capitalize text-gray-700 hover:text-primary transition-colors font-medium">
							{link.name}
{/* 							<FaAngleDown className={`text-xs transition-transform ${activeDropdown === index ? 'rotate-180' : ''}`} /> */}
						</button>

						{/* Dropdown Menu */}
						{activeDropdown === index && (
						<div 
							className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border min-w-64 z-50 py-2"
							onMouseEnter={handleDropdownMouseEnter}
							onMouseLeave={handleDropdownMouseLeave}
						>
							{link.subItems.map((subItem, subIndex) => (
								<div key={subIndex}>
									{/* {link.path === "/rent" ? console.log("yes") : console.log("no")} */}
									<Link
										href={subItem.path}
										className={`block px-4 py-3 hover:text-gray-900 transition-colors ${
											subItem.highlight 
												? 'text-primary font-semibold border-t border-gray-100 mt-1 pt-3' 
												: 'text-gray-500'
										}`}
										onClick={() => setActiveDropdown(null)}
									>
										{subItem.name}
									</Link>
								</div>
							))}
						</div>
            )}
            </Link>
          )
        })}
      </nav>
      {/* User Area */}
      {user ? (
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors"
          >
            <div className="flex items-center gap-4">
              <Link href="/messages">
                <MdOutlineMarkEmailUnread className="text-xl text-gray-800"/>
              </Link>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-medium">{getUserDisplayName()}</div>
                  <div className="text-xs text-gray-500">{getUserRoleDisplay()}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <img 
                    src={user.avatar || "assets/agent-1.png"} 
                    className="rounded-full w-full h-full object-cover"
                    alt="User avatar"
                  />
                </div> 
                <FaAngleDown className="text-xl text-gray-400"/>
              </div>
            </div>
          </button>
          
          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-70 bg-white rounded-lg shadow-lg border p-4 z-50">
              <div className="space-y-3">
                <div className="pb-2 border-b">
                  <div className="font-sm">{user.email}</div>
                  <div className="text-sm text-gray-500">{getUserRoleDisplay()}</div>
                </div>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors block"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span>Dashboard</span>
                </Link>
                <Link 
                  href="/messages" 
                  className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors block"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span>Messages</span>
                </Link>
                <button className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors w-full text-left">
                  <span>Switch to {user.role === 'agent' ? 'Buyer/Renter' : 'Agent/Landlord'} Mode</span>
                </button>
                <div className="border-t pt-3">
                  <button 
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
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

export default Nav;