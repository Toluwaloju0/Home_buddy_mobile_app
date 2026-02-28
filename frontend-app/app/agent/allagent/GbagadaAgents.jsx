"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaStar } from "react-icons/fa";
import { FaAngleRight } from 'react-icons/fa';
import { FaAngleLeft } from 'react-icons/fa';
import { FaRegMessage } from "react-icons/fa6";
import { IoCallOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";

const agents = [
	{
		image: "/assets/agent-8.png",
		name: "Sarah Martin",
		company: "PrimeWEdge Properties",
		rating: "4.8",
		reviews: "128",
		listed: "42",
		sold: "31",
		rent: "",
	},
	{
		image: "/assets/agent-9.png",
		name: "Kunle Adebayo",
		company: "Greenfield Reality",
		rating: "4.7",
		reviews: "128",
		listed: "42",
		sold: "31",
		rent:"2",
	},
	{
		image: "/assets/agent-10.png",
		name: "Sarah Johnson",
		company: "LandLink Ltd.",
		rating: "4.8",
		reviews: "77",
		listed: "60",
		sold: "48",
		rent:"",
	},
	{
		image: "",
		name: "Sarah Johnson",
		company: "LandLink Ltd.",
		rating: "4.8",
		reviews: "77",
		listed: "60",
		sold: "48",
		rent: "",
	},
];

const GbagadaAgents = () => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [agentPerSlide, setAgentPerSlide] = useState(1);
	const [isTransitioning, setIsTransitioning] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			
			if (width < 640) {
				setAgentPerSlide(1);
			} else if (width >= 640 && width < 768) {
				setAgentPerSlide(2);
			} else {
				setAgentPerSlide(3);
			}
			
			// Reset to first agent on resize
			setCurrentIndex(0);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const nextSlide = () => {
		if (isTransitioning || currentIndex >= agents.length - agentPerSlide) return;
		
		setIsTransitioning(true);
		setCurrentIndex(prev => prev + 1);
		
		setTimeout(() => setIsTransitioning(false), 300);
	};

	const prevSlide = () => {
		if (isTransitioning || currentIndex <= 0) return;
		
		setIsTransitioning(true);
		setCurrentIndex(prev => prev - 1);
		
		setTimeout(() => setIsTransitioning(false), 300);
	};

	// Calculate visible agents based on currentIndex
	const visibleAgents = agents.slice(currentIndex, currentIndex + agentPerSlide);

	return (
		<div className="relative mb-8">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-5xl text-black font-bold">Top agents in Gbagada</h1>
				<div className="flex items-center gap-4">
					<button
						onClick={prevSlide}
						disabled={isTransitioning || currentIndex <= 0}
						className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="Previous agent"
					>
						<FaAngleLeft className="text-lg md:text-xl" />
					</button>
					
					<button
						onClick={nextSlide}
						disabled={isTransitioning || currentIndex >= agents.length - agentPerSlide}
						className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="Next agent"
					>
						<FaAngleRight className="text-lg md:text-xl" />
					</button>
				</div>
			</div>
			
			<div className={`grid grid-cols-1 ${agentPerSlide >= 2 ? 'sm:grid-cols-2' : ''} ${agentPerSlide >= 3 ? 'md:grid-cols-3' : ''} gap-4 sm:gap-6 pb-10 p-8 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]`}>
				{visibleAgents.map((agent, index) => (
					<div 
						key={`${agent.name}-${currentIndex + index}`} 
						className="flex flex-col border border-gray-200 rounded-xl p-4 w-full hover:shadow-lg transition-shadow duration-300"
					>
						<div className="flex flex-col sm:flex-row mb-8 p-4 border border-gray-200">
							<div className="flex justify-center sm:justify-start mb-4 sm:mb-0 sm:mr-4">
								<div className="w-24 h-24 sm:w-28 sm:h-28">
									<img 
										src={agent.image} 
										alt={agent.name}
										className="w-full h-full object-cover rounded-full border-4 border-white shadow-md" 
									/>
								</div>
							</div>
							
							<div className="flex-1 text-center sm:text-left">
								<h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">{agent.name} <span><MdVerified className="text-sm text-green-700"/></span></h3>
								<p className="text-gray-500 text-sm sm:text-base mb-1">{agent.company}</p>
								
								<div className="flex justify-center sm:justify-start items-center gap-2">
									<div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
										<p className="text-gray-800 text-sm">{agent.rating}</p>
										<FaStar className="text-yellow-400 text-sm" />
									</div>
									<p className="text-gray-600 text-sm font-bold">{agent.reviews} Reviews</p>
								</div>
								
								<div className="bg-gray-50 px-2 py-1 rounded-lg mt-1">
									<p className="text-gray-700 text-sm">
										<span>{agent.listed}</span> Properties Listed | 
										<span> {agent.sold}</span> Sold | 
										<span> {agent.rent} Rented</span>
									</p>
								</div>
							</div>
						</div>
						
						<div className="flex flex-col items-center justify-center sm:flex-row gap-3">
							<Button 
								variant="outline" 
								className="flex-1 bg-[#2D3748] text-white hover:text-white hover:bg-[#1a202c] border-[#2D3748]"
							>
								View Profile
							</Button>
							<Button 
								variant="outline" 
								className="flex-1 border-gray-300 hover:bg-gray-50"
							>
								<IoCallOutline />
								Call Agent
							</Button>
							<Button 
								variant="outline" 
								className="flex-1 border-gray-300 hover:bg-gray-50"
							>
								<FaRegMessage />
								Send Message
							</Button>
						</div>
					</div>
				))}
			</div>
			<div className="font-bold text-md mt-8 text-gray-800">See all 4 Top agents in Gbagada</div>
		</div>
	);
};

export default GbagadaAgents;