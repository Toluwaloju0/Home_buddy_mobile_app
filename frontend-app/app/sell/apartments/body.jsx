
import { Button } from '@/components/ui/button';
import Hero from './Hero';

import { FaCheckCircle } from "react-icons/fa";

const benefits = [
	{ 
		image: "/assets/Vector-2.png",
		reason: "verified Buyers", 
		description: "Connect with genuine buyers who are ready to purchase",
	},
	{ 
		image: "/assets/money.png",
		reason: "Best Market Price", 
		description: "Professional valuation ensures you get the best price for your property",
	},
	{ 
		image: "/assets/flash.png",
		reason: "Quick Sales", 
		description: "Average sale time of 30-45 days with our extensive buyer network",
	},
	{ 
		image: "/assets/fluent-mdl2_payment-card.png",
		reason: "Escrow Payment", 
		description: "Enjoy peace of mind with secure, transparent payment on every sale",
	},
];

const works = [
	{
		title: "List Your Property",
		number: "1",
		description: "Fill out our simple form with your apartment details"
	},
	{
		title: "Get Valued",
		number: "2",
		description: "Our experts provide a professional property valuation"
	},
	{
		title: "Marketing Begins",
		number: "3",
		description: "We create stunning listings and promote to our buyer network"
	},
	{
		title: "Show & Negotiate",
		number: "4",
		description: "We arrange viewings and handle all negotiations"
	},
	{
		title: "Close the Deal",
		number: "5",
		description: "Complete legal process and receive your payment"
	},
];

const services = [
	{
		plan: "Starter Plan",
		commission: "1.5%",
		subItems: [
			{ list: "Online listing for 60 days" },
			{ list: "Basic property photos" },
			{ list: "Standard decsription" },
			{ list: "Email inquiries" },
			{ list: "Basic buyer screening" },
		],
	},
	{
		plan: "Enterprise Plan",
		commission: "4%",
		subItems: [
			{ list: "Everythin in Pro Plan" },
			{ list: "Video walkthrough" },
			{ list: "Social media campaign" },
			{ list: "ROI analysis for buyers" },
			{ list: "Full legal & tax support" },
		],
	},
	{
		plan: "Pro Plan",
		commission: "4%",
		subItems: [
			{ list: "Professional photography" },
			{ list: "Floor plan & measurements" },
			{ list: "Prority listing placement" },
			{ list: "Commercial valuation report" },
			{ list: "Dedicated sales agent" },
		],
	},
]


const Body = () => {
	return (
		<div>
			<div className='mb-4'>
				<Hero/>
			</div>
			<div className="container mx-auto px-4 py-8 md:px-14 md:py-10 lg:px-16">
				<h1 className='text-5xl text-center font-bold mb-12'>Why Sell with Home Buddy</h1>
				{/* Options Section */}
        <div className="mb-12 md:mb-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col items-center justify-center hover:shadow-lg transition-all duration-300 border border-gray-300 p-4 md:p-6"
              >
                <div className="relative h-12 w-12 md:h-15 md:w-15 mb-3 md:mb-0">
                  <img src={item.image} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-2 md:p-4 flex flex-col items-center text-center">
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800">{item.reason}</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed text-center">{item.description}</p>
                 
                </div>
              </div>
            ))}
          </div>
        </div>
			</div>

			<div className='container mx-auto px-4 py-8 md:px-6 md:py-8 lg:px-12'>
				<div className="mb-8 md:mb-16">
					<h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12'>How it works</h1>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
						{works.map((itm, index) => {
							return (
								<div key={index} className='bg-white overflow-hidden flex flex-col items-center justify-center p-4'>
								<h3 className='font-bold text-base md:text-lg lg:text-xl mb-2 text-center'>{itm.title}</h3>
								<div className="relative h-8 w-8 md:h-10 md:w-10 overflow-hidden bg-green-900 rounded-full flex items-center justify-center mb-3">
                  <p className='text-white text-sm md:text-md'>{itm.number}</p>
                </div>
                <div className="pt-2 md:pt-4 flex flex-col items-center">
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed text-center">{itm.description}</p>
                </div>
							</div>
							)
						})}
					</div>
				</div>	
			</div>

			{/* service package */}
			<div className='container mx-auto px-4 py-8 md:px-6 md:py-8 lg:px-8'>
				<div className='mb-12 md:mb-16'>
					<h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12'>Our Service Packages</h1>
					<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
						{services.map((items, idx) => {
							return (
								<div key={idx} className='border-2 rounded-md border-yellow-300 p-4 md:pt-5 md:pl-12 flex flex-col items-start gap-3 md:gap-4 justify-center group hover:border-gray-900 hover:bg-gray-900 duration-300 ease-in-out'>
									<Button className="px-5 py-4 bg-yellow-400 text-black font-semibold text-sm">{items.plan}</Button>
									<div className='flex items-center group-hover:text-white duration-300 ease-in-out'>
										<p className='text-2xl font-semibold mr-3'>{items.commission}</p>
										<p className='text-sm'>commission on sale</p>
									</div>
									<div className='mb-4'>
										{items.subItems.map((subItem, subIndex) => {
											return (
												<div key={subIndex} className='flex gap-2 items-center'>
													<FaCheckCircle className='text-green-800 group-hover:text-white duration-300 ease-in-out' />
													<p className='text-gray-400 group-hover:text-white duration-300 ease-in-out'>{subItem.list}</p>
												</div>
											)
										})}
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>

			{/* Ready to sell your apartment? */}
			<div className='container mx-auto px-4 py-8 md:px-6 md:py-8 lg:px-14'>
				<div className='border-2 px-4 py-6 rounded-md'>
					<h2 className='text-5xl font-bold text-center mb-6'>Ready to sell your apartment?</h2>
				<p className='text-gray-600 text-center mb-8'>Contact us today to get started with a free consultation!</p>
				<div className='flex justify-center'>
					<Button className='px-4 py-3 md:px-6 md:py-6 text-white bg-[#243235] text-sm md:text-base'>Get Started</Button>
				</div>
				</div>
				
			</div>
		</div>
	)
}

export default Body