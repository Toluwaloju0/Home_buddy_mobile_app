import Link from "next/link";
import { Button } from "./ui/button";
import { FaStar } from "react-icons/fa";

const agents = [
	{
		image: "assets/agent-1.png",
		name: "Chika Nwosu",
		company: "Greenfield Reality",
		rating: "4.8",
		reviews: "120",
		listed: "42",
		sold: "31", 
	},
	{
		image: "assets/agent-2.png",
		name: "Kunle Adebayo",
		company: "PrimeWEdge Properties",
		rating: "4.7",
		reviews: "94",
		listed: "37",
		sold: "25", 
	},
	{
		image: "assets/agent-3.png",
		name: "Sarah Johnson",
		company: "LandLink Ltd.",
		rating: "4.8",
		reviews: "77",
		listed: "60",
		sold: "48", 
	},
]



const Verifiedagents = () => {
  return (
    <div className="">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-10">
        {agents.map((agent, index) => {
          return (
            <div 
              key={index} 
              className="flex flex-col sm:flex-row border border-gray-200 rounded-xl sm:rounded-md p-4 w-full hover:shadow-lg transition-shadow duration-300"
            >
              {/* Agent Image */}
              <div className="flex justify-center sm:justify-start mb-4 sm:mb-0 sm:mr-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28">
                  <img src={agent.image} className="w-full h-full object-cover rounded-full border-4 border-white shadow-md" />
                </div>
              </div>
              
              {/* Agent Info */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{agent.name}</h3>
                <p className="text-gray-500 text-sm sm:text-base mb-1">{agent.company}</p>
                
                {/* Rating and Reviews */}
                <div className="flex justify-center sm:justify-start items-center gap-2 ">
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                    <p className="text-gray-800 text-sm">{agent.rating}</p>
                    <FaStar className="text-yellow-400 text-sm" />
                  </div>
                  <p className="text-gray-600 text-sm font-bold">{agent.reviews} Reviews</p>
                </div>
                
                {/* Stats */}
                <div className="bg-gray-50 px-2 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    <span>{agent.listed}</span> Properties Listed | 
                    <span> {agent.sold}</span> Sold
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

			{/* Coming soon */}
			<div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-8 md:gap-12 mb-16 md:mb-20 px-4 md:px-0">
				{/* Section 1 - Content */}
				<div className="flex flex-col items-center md:items-start text-center md:text-left">
					<div>
						<h1 className="text-2xl md:text-3xl text-black font-bold pb-3 md:pb-4">
							Coming Soon on Mobile
						</h1>
						<p className="text-gray-500 md:text-gray-400 pb-4 md:pb-6 text-sm md:text-base">
							Experience Home Buddy on the go.
							<br className="hidden md:block" />
							Buy, Rent, Sell or Manage Properties on your mobile phone.
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
						{/* Google Play Store Button */}
						<div className="border border-gray-200 rounded-xl md:rounded-none flex items-center gap-3 p-3 md:p-4 w-full md:w-60 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer">
							<img src="assets/Playstore.png" className="h-8 w-8 md:h-10 md:w-10 object-contain" />
							<div className="text-left">
								<p className="text-xs md:text-sm uppercase text-gray-500">Get it on</p>
								<p className="font-bold text-base md:text-xl">Google Play</p>
							</div>
						</div>
						
						{/* Apple App Store Button */}
						<div className="border border-gray-200 rounded-xl md:rounded-none flex items-center gap-3 p-3 md:p-4 w-full md:w-60 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer">
							<img src="assets/Apple.png" className="h-8 w-8 md:h-10 md:w-10 object-contain" />
							<div className="text-left">
								<p className="text-xs md:text-sm uppercase text-gray-500">Download on the</p>
								<p className="font-bold text-base md:text-xl">App Store</p>
							</div>
						</div>
					</div>
				</div>
				
				{/* Section 2 - Phone Image */}
				<div className="flex items-center justify-center mb-6 md:mb-0">
					<img 
						src="assets/phone.png" 
						alt="Mobile App Preview" 
						className="object-contain h-auto w-48 md:w-64 lg:h-[250px] lg:w-auto max-w-full"
					/>
				</div>
			</div>

			{/* Start your move today - Mobile Optimized */}
			<div className="text-center px-4 md:px-0">
				<p className="font-bold text-2xl md:text-3xl lg:text-4xl pb-3 md:pb-5 leading-tight">
					Start your next move today
				</p>
				<p className="font-bold text-2xl md:text-3xl lg:text-4xl pb-4 md:pb-6 md:text-black leading-tight">
					Buy, Rent or Sell with confidence
				</p>
				<div className="flex justify-center">
					<Link href="/">
						<Button className="py-6 px-8 md:py-6 md:px-8 text-base md:text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 w-full max-w-xs md:w-auto">
							Join/Sign in
						</Button>
					</Link>
				</div>
			</div>
			
		</div>
  )
}

export default Verifiedagents