"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import Link from "next/link";
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import { FaAngleDown, FaAngleLeft } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { IoPersonOutline } from "react-icons/io5";
import { BiBuildings } from "react-icons/bi";
import { FaWallet } from "react-icons/fa";
import { MdOutlineFlag } from "react-icons/md";
import { IoShieldOutline } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";

const links = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <RxDashboard className="text-xl text-white" />
  },
  {
    name: "Agents & landlords",
    path: "/agents&landlords",
    icon: <IoPersonOutline className="text-xl text-white" />,
    subItems: [
      { name: "All Agents", path: "/agents&landlords/allagents" },
      { name: "pending KYC", path: "/agents&landlords/kyc" },
    ],
  },
  {
    name: "Properties",
    path: "/properties",
    icon: <BiBuildings className="text-xl text-white" />,
    subItems: [
      { name: "All Listings", path: "/properties/alllistings" },
      { name: "Pending Review", path: "/properties/pendingreviews" },
    ],
  },
  {
    name: "Transaction",
    path: "/transaction",
    icon: <FaWallet className="text-xl text-white" />,
    subItems: [
      { name: "All Transactions", path: "/transaction/alltransaction" },
      { name: "Active Escrows", path: "/transaction/activeescrows" },
    ],
  },
  {
    name: "Disputes & Reports",
    path: "/disputes",
    icon: <MdOutlineFlag className="text-xl text-white" />,
    subItems: [
      { name: "All Disputes", path: "/disputes/alldisputes" },
      { name: "Open Disputes", path: "disputes/opendisputes" },
    ],
  },
  {
    name: "Fraud Monitoring",
    path: "/fraud",
    icon: <IoShieldOutline className="text-xl text-white" />,
    subItems: [
      { name: "Flagged Users", path: "/fraud/flaggedusers" },
      { name: "Flagged Listings", path: "/fraud/flaggedlistings" },
      { name: "Payemnt Anomalities", path: "/fraud/anomalies" },
    ],
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: <TbReportAnalytics className="text-xl text-white" />,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <IoSettingsOutline className="text-xl text-white" />,
  },
  {
    name: "Logout",
    icon: <TbLogout2 className="text-xl text-white" />,
  },
];

const DashboardNav = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const getUserDisplayName = () => {
    if (!user?.email) return "Chika";
    return user.email.split("@")[0];
  };

  const getUserRoleDisplay = () => {
    if (!user?.role) return "";
    return user.role === "agent" ? "Agent/Landlord" : "Buyer/Renter";
  };

  return (
    <>
      <header className="py-4 px-6 xl:py-5 xl:px-20 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 relative">
            <Link href="/" className="flex items-center">
              <img
                src="/assets/logo.png"
                className="w-20 h-20 xl:w-24 xl:h-24"
                alt="Logo"
              />
            </Link>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FaAngleLeft
                className={`text-2xl text-gray-800 border-2 rounded-md transition-transform ${
                  sidebarOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <div>
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Link href="/messages">
                      <MdOutlineMarkEmailUnread className="text-xl text-gray-800" />
                    </Link>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-medium">{getUserDisplayName()}</div>
                        <div className="text-xs text-gray-500">
                          {getUserRoleDisplay()}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <img
                          src={user.avatar || "assets/agent-1.png"}
                          className="rounded-full w-full h-full object-cover"
                          alt="User avatar"
                        />
                      </div>
                      <FaAngleDown className="text-xl text-gray-400" />
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-70 bg-white rounded-lg shadow-lg border p-4 z-50">
                    <div className="space-y-3">
                      <div className="pb-2 border-b">
                        <div className="font-sm">{user.email}</div>
                        <div className="text-sm text-gray-500">
                          {getUserRoleDisplay()}
                        </div>
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
                        <span>
                          Switch to{" "}
                          {user.role === "agent"
                            ? "Buyer/Renter"
                            : "Agent/Landlord"}{" "}
                          Mode
                        </span>
                      </button>
                      <div className="border-t pt-3">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                            router.push("/");
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
            )}
          </div>
        </div>
      </header>

      {/* Sidebar - always rendered, width changes based on sidebarOpen */}
      <div
        className={`fixed left-0 top-28 xl:top-34 h-[calc(100vh-7rem)] xl:h-[calc(100vh-8rem)] bg-[#243235] p-4 z-40 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? "w-[300px]" : "w-[80px]"
        }`}
      >
        <nav>
          {links.map((link, index) => (
            <div key={index} className="mb-1">
              {link.path ? (
                // Link with path
                <Link
                  href={link.path}
                  className={`flex items-center gap-2 text-white hover:bg-gray-700 p-2 rounded`}
                >
                  {link.icon}
                  {sidebarOpen && (
                    <>
                      <span className="flex-1">{link.name}</span>
                      {link.subItems && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveDropdown(
                              activeDropdown === index ? null : index
                            );
                          }}
                        >
                          <FaAngleDown
                            className={`transition-transform ${
                              activeDropdown === index ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </>
                  )}
                </Link>
              ) : (
                // Non-link items (e.g., Logout)
                <div
                  className={`flex items-center gap-2 text-white p-2 rounded ${
                    link.name === "Logout"
                      ? "cursor-pointer hover:bg-gray-700"
                      : ""
                  }`}
                  onClick={() => {
                    if (link.name === "Logout") {
                      logout();
                      router.push("/");
                    }
                  }}
                >
                  {link.icon}
                  {sidebarOpen && (
                    <>
                      <span className="flex-1">{link.name}</span>
                      {link.subItems && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(
                              activeDropdown === index ? null : index
                            );
                          }}
                        >
                          <FaAngleDown
                            className={`transition-transform ${
                              activeDropdown === index ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
              {/* SubItems - only shown when sidebar is open and dropdown active */}
              {sidebarOpen && link.subItems && activeDropdown === index && (
                <div className="pl-4 mt-1">
                  {link.subItems.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      href={subItem.path}
                      className={`block text-white hover:bg-gray-700 p-2 rounded ${
                        pathname === subItem.path ? "bg-gray-700" : ""
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default DashboardNav;