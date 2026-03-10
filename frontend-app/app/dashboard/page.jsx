"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DashboardNav from "@/components/DashboardNav";
import { BiBuildings } from "react-icons/bi";
import { IoPersonOutline } from "react-icons/io5";
import { FaWallet } from "react-icons/fa";
import { MdOutlineFlag } from "react-icons/md";
import { IoShieldOutline } from "react-icons/io5";
import { TbHomeCheck } from "react-icons/tb";
import { MdBalance } from "react-icons/md";
import { Card, CardContent } from "@/components/ui/card";

const activities = [
  {
    title: "Total Listings",
    figure: "1247",
    label: "89 for sale . 153 for rent",
    icon: <BiBuildings className="text-3xl"/>,
  },
  {
    title: "Active Agents",
    figure: "324",
    label: "18 pendng verification",
    icon: <IoPersonOutline className="text-3xl text-yellow-400"/>,
  },
  {
    title: "Active Escow",
    figure: "N50.3M",
    label: "30 active transactions",
    icon: <FaWallet className="text-3xl text-green-900"/>, 
  },
  {
    title: "Open Disputes",
    figure: "7",
    label: "2 require immediate action",
    icon: <MdOutlineFlag className="text-3xl text-red-500"/>,
  }
];



const Page = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <DashboardNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-[300px]" : "ml-[80px]"}`}>
        
        <div className="p-10 xl:p-8">
          <h1 className="text-2xl font-bold mb-3">Welcome back, Admin!</h1>
          {/* cards */}
          <div className="xl:flex xl:items-center w-full justify-around mb-3">
            {activities.map((item, index) => (
              <Card className={`rounded-md shadow-sm mb-5 ${sidebarOpen ? "xl:w-[280px]" : "xl:w-[330px]"}`} key={index}>
                <CardContent className="px-3">
                  <div  className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <span>{item.title}</span>
                      <p className="text-xl font-bold">{item.figure}</p>
                      <p className="text-xs text-gray-400">{item.label}</p>
                    </div>
                    {item.icon}
                  </div>
                  
                </CardContent>
            </Card>
              
            ))}
            
          </div>
          {/* pending task */}
          <div className="w-full p-6 border-2 rounded-md mb-8">
            <h1 className="font-bold text-sm text-gray-500 mb-4">Pending Tasks</h1>
            <div className="flex flex-col xl:flex-row gap-3">
              <div className="text-yellow-500 border-2 p-5 w-full flex flex-col items-start rounded-md bg-yellow-100 border-yellow-500">
                <p className="text-xl font-bold">18</p>
                <p>KYC Verification</p>
              </div>

              <div className="text-green-500 border-2 p-5 w-full flex flex-col items-start rounded-md bg-green-100 border-green-500">
                <p className="text-xl font-bold">12</p>
                <p>Escrow Release</p>
              </div>

              <div className="text-orange-500 border-2 p-5 w-full flex flex-col items-start rounded-md bg-orange-100 border-orange-500">
                <p className="text-xl font-bold">24</p>
                <p>Property Review</p>
              </div>

              <div className="text-red-500 border-2 p-5 w-full flex flex-col items-start rounded-md bg-red-100 border-red-500">
                <p className="text-xl font-bold">3</p>
                <p>Fraud Alerts</p>
              </div>
            </div>

          </div>

          {/* recent activity */}
          <div className="w-full p-6 border-2 rounded-md mb-5">
            <h1 className="text-gray-500 text-md mb-3 font-bold">Recent Activity</h1>
            <div className="flex flex-col gap-5 p-5">
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IoPersonOutline className="text-xl"/>
                  <p className="text-md">New agent registration</p>
                </div>
                <p className="font-bold text-gray-500 text-md">10 mins ago</p>
              </div>
              
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BiBuildings className="text-xl"/>
                  <p className="text-md">Property listed</p>
                </div>
                <p className="font-bold text-gray-500 text-md">10 mins ago</p>
              </div>

              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaWallet className="text-xl"/>
                  <p className="text-md">Escrow completed</p>
                </div>
                <p className="font-bold text-gray-500 text-md">50 mins ago</p>
              </div>

               <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MdOutlineFlag className="text-xl"/>
                  <p className="text-md">Dispute opened</p>
                </div>
                <p className="font-bold text-gray-500 text-md">1 hour ago</p>
              </div>

               <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaWallet className="text-xl"/>
                  <p className="text-md">Payment received</p>
                </div>
                <p className="font-bold text-gray-500 text-md">1 hour ago</p>
              </div>
            </div>
          </div>

          {/* quick actions */}
          <div className="flex flex-col xl:flex-row gap-4 mb-3">
            <div className="p-4 border-2 rounded-md">
              <h1 className="text-gray-500 text-md font-semibold mb-3">Quick Action</h1>
              <div className="w-full flex items-center justify-center mb-3"><IoShieldOutline className="text-5xl"/></div>
              <div className="flex flex-col gap-3">
                <h1 className="font-semibold">Review KYC</h1>
                <p className="font-semibold text-gray-500 leading-snug">Verify agents and landlord identities to maintain platform trust</p>
                <Button className="w-full"><Link href="/">Review KYC</Link></Button>
              </div>
            </div>

            <div className="p-4 border-2 rounded-md">
              <h1 className="text-gray-500 text-md font-semibold mb-3">Quick Action</h1>
              <div className="w-full flex items-center justify-center mb-3"><TbHomeCheck className="text-5xl"/></div>
              <div className="flex flex-col gap-3">
                <h1 className="font-semibold">Verify Properties</h1>
                <p className="font-semibold text-gray-500 leading-snug">Confirm property details, documents and listing accuracy</p>
                <Button className="w-full"><Link href="/">Verify Properties</Link></Button>
              </div>
            </div>

            <div className="p-4 border-2 rounded-md">
              <h1 className="text-gray-500 text-md font-semibold mb-3">Quick Action</h1>
              <div className="w-full flex items-center justify-center mb-3"><FaWallet className="text-5xl"/></div>
              <div className="flex flex-col gap-3">
                <h1 className="font-semibold">Manage Escrow</h1>
                <p className="font-semibold text-gray-500 leading-snug">onitor payments, hold funds securely, and release when approved.</p>
                <Button className="w-full"><Link href="/">Manage Escrow</Link></Button>
              </div>
            </div>

            <div className="p-4 border-2 rounded-md">
              <h1 className="text-gray-500 text-md font-semibold mb-3">Quick Action</h1>
              <div className="w-full flex items-center justify-center mb-3"><MdBalance className="text-5xl"/></div>
              <div className="flex flex-col gap-3">
                <h1 className="font-semibold">Handle Disputes</h1>
                <p className="font-semibold text-gray-500 leading-snug">Resolve conflicts between buyers, renters and agents fairly.</p>
                <Button className="w-full"><Link href="/">Handle Disputes</Link></Button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;