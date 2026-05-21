"use client";
import CountUp from "react-countup";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


import { BsStars } from "react-icons/bs";
import { IoShieldCheckmark } from "react-icons/io5";
import { BsPeopleFill } from "react-icons/bs";
import { IoBulb } from "react-icons/io5";
import { IoHeart } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";

import Footer from '@/components/Footer';

const stats = [
	{
		num: 1000,
		text: "Verified Properties",
	},
	{
		num: 500,
		text: "Happy Clients",
	},
	{
		num: 100,
		text: "Verified Agents",
	},
]

const values = [
	{
		icon: <BsStars className="h-full w-full text-black text-3xl"/>,
		title: "Trust & Transparency",
		text: "We prioritize honesty in every transaction. For verified listings secure payments, Users enjoy a platform they can rely on.",
	},
	{
		icon: <IoShieldCheckmark className="h-full w-full text-black text-3xl"/>,
		title: "Security First",
		text: "Your safety is our priority. With escrow payments, identity verification, and strict KYC standards, every property interaction is protected.",
	},
	{
		icon: <BsPeopleFill className="h-full w-full text-black text-3xl"/>,
		title: "Community Empowerment",
		text: "We support local agents, property owners, and neighborhoods by promoting better housing experiences for everyone."
	},
	{
		icon: <IoBulb className="h-full w-full text-black text-3xl"/>,
		title: "Simplicity & Ease",
		text: "We remove the complexity from renting, buying or listing properties."
	},
	{
		icon: <IoHeart className="h-full w-full text-black text-4xl"/>,
		title: "Customer Centeric Service",
		text: "Your comfort and success guide our decisions"
	},
];

const teams = [
	{
		image: "/assets/team 1.png",
		name: "Adebayo Ogunlade",
		title: "Founder & CEO",
	},
	{
		image: "/assets/team 2.jpg",
		name: "Chioa Nwankwo",
		title: "Head of Operations",
	},
	{
		image: "/assets/team 3.png",
		name: "Ibrahim Yusuf",
		title: "Head of Technology",
	},
	{
		image: "/assets/team 4.jpg",
		name: "Funmi Adeleke",
		title: "Head of Agents Relations",
	},
];


const faqs = [
  {
    question: "How do I list my property?",
    answer:
      "To list your property, create an account or log in, navigate to the “List My Property” section, fill in all required details including photos, location, price, and amenities. Our team will verify your listing within 24-48 hours, and once approved, it will go live on our platform.",
  },
  {
    question: "How do escrow payments work?",
    answer:
      "Escrow payments are securely held by a third party until both buyer and seller fulfill the agreed terms. Once all conditions are met, the funds are released. This protects both parties during the transaction.",
  },
  {
    question: "How do I schedule an inspection?",
    answer:
      "You can schedule an inspection by visiting the property page and clicking 'Request Inspection', or by contacting the property owner directly through our messaging system. Our team will confirm the appointment within 24 hours.",
  },
];


const page = () => {
  return (
    <div>
			<section className="relative w-full h-[400px] sm:h-[450px] md:h-[470px] bg-cover bg-center" style={{ backgroundImage: "url('assets/about-page.jpg')", backgroundPosition: "bottom", backgroundSize: "cover" }}>
				{/* Content container */}
				<div className="absolute top-[120px] sm:top-[140px] lg:top-[160px] w-full px-4 sm:px-8 lg:pl-26 text-center sm:text-left">
					<h1 className="text-white font-bold text-3xl sm:text-4xl md:text-5xl leading-tight sm:leading-snug max-w-4xl mx-auto sm:mx-0">
						Your Trusted Partner for Property <br />
						Rentals, Sales & Management
					</h1>
					
				</div>
			</section>

			<div className="mt-8 mb-18">
				<section className="pt-4 pb-12 xl:pt-0 xl:pb-0">
					<div className="container mx-auto">
						<div className="flex flex-wrap gap-6 max-w-[80vm] mx-auto xl:max-w-none">
							{stats.map((item, index) => {
								return (
									<div key={index}
									className="flex-1 flex flex-col gap-4 items-center justify-center xl:justify-start">
										<div className="flex items-center">
											<CountUp 
											end={item.num}
											duration={5}
											delay={2}
											className="text-4xl xl:text-6xl font-semibold"
										/> <span className="text-4xl font-bold">+</span>
										</div>
										<p className="max-w-[150px] leading-snug text-gray-500">{item.text}</p>
									</div>
								)
							})}
						</div>
					</div>
				</section>
			</div>

			<div className="container mx-auto px-4 py-8 md:px-10 md:py-8 mb-8">
				<div className="flex gap-3 justify-center items-center">

					<div className="flex items-start self-start flex-col">
						<h1 className="text-sm font-bold">Our Mission</h1>
						<p className="text-xs text-gray-400 tracking-tight max-w-[400px]">To simplify property discovery, property
							management, and secure transactions for
							everyone whether you're buying, renting, or listing
							your property
						</p>
					</div>
					
					<div className="w-70 h-70 sm:w-100 sm:h-100">
						<img src="/assets/about-image.jpg" alt="About Us" className="w-full h-full object-cover rounded-full border-4 border-white shadow-md" />
					</div>
					
					<div className="flex items-start flex-col self-end">
						<h1 className="text-sm font-bold">Our Vision</h1>
						<p className="text-xs text-gray-400 tracking-tight max-w-[400px]">To create Nigeria's most Trusted 
							digital property platform for safe transparent, and convenient home rentals.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8 md:px-10 md:py-8 mb-8">
				<h1 className="text-3xl md:text-4xl font-bold text-center">Core Value</h1>
				<div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3 my-3">
					{values.map((value, idx)=>{
					return (
						<div key={idx} className="mb-3">
							<div className="flex items-start gap-3">
								<div className="h-8 w-8 bg-gray-300 rounded-sm p-2">
									{value.icon}
								</div>
								<div>
									<h1 className="text-sm font-semibold mb-1">{value.title}</h1>
									<p className="text-xs text-gray-400">{value.text}
									</p>
								</div>
							</div>
						</div>
					)
				})}
				</div>
				
			</div>

			{/* Meet our team */}
			<div className="container mx-auto px-4 py-8 md:px-10 md:py-8 mb-8">
				<div className="flex flex-col items-center gap-4 justify-center">
					<h1 className="text-3xl font-bold text-black">Meet Our Team</h1>
					<p className="text-md text-gray-500">A dedicated tea of innovators, engineers, and creative comitted to making property search and manaagement easier.</p>
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-5 place-items-center container">
						{teams.map((items, idex) => 
							(
								<div key={idex} className="flex flex-col items-center justify-center">
									<div className="h-64 w-64 relative md:h-58 md:w-58 mb-1">
										<Image src={items.image} fill className="object-cover rounded-sm"/>
									</div>
									<p className="mb-1">{items.name}</p>
									<p className="text-gray-400">{items.title}</p>
								</div>
						))}
					</div>
				</div>
			</div>
			
			{/* Frequently asked question */}

			<div className="container mx-auto px-4 py-8 md:px-10 md:py-8 mb-8">
				<div>
					<section className="w-full py-20">
						<div className="max-w-4xl mx-auto px-6">
							<h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
								Frequently Asked Questions
							</h1>

							<Accordion
								type="single"
								collapsible
								defaultValue="item-0"
								className="space-y-6"
							>
								{faqs.map((faq, index) => (
									<AccordionItem
										key={index}
										value={`item-${index}`}
										className="bg-gray-200 rounded-xl px-6 py-4 border-none"
									>
										<AccordionTrigger className="group text-left text-lg font-semibold hover:no-underline [&>svg]:hidden">
											<div className="flex w-full items-center justify-between">
												<span>{faq.question}</span>

												<span className="ml-4 relative h-5 w-5">
													<FaPlus className="absolute inset-0 group-data-[state=open]:hidden" />
													<FaMinus className="absolute inset-0 hidden group-data-[state=open]:block" />
												</span>
											</div>
										</AccordionTrigger>

										<AccordionContent className="text-gray-600 text-base leading-relaxed pt-4">
											{faq.answer}
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>

						</div>
					</section>

				</div>
			</div>

			{/* rent, sell or buy */}
			<div className="container mx-auto px-4 py-8 md:px-10 md:py-8 mb-8">
				<div className="text-center">
					<p className="text-center font-bold text-5xl mb-4">Start your next move today</p>
					<p className="text-center font-bold text-5xl mb-4">Buy, Rent, or Sell with Confidence</p>
					<Link href="/join">
						<Button className="px-8 py-6 text-sm">Join / Sign in</Button>
					</Link>
				</div>
			</div>

			{/* footer */}
			<Footer />

    </div>
  )
}

export default page
	
