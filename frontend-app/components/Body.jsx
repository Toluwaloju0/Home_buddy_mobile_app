
import { Icon } from "lucide-react";



const options = [
	{
		title: "Buy",
		description: "Featured Homes, Lands & Shops for Sales",
		image: "assets/buy.png",
		button: "Search",
	},
	{
		title: "Rent",
		description: "Top Apartments, Short Lets & Shops for Rent",
		image: "assets/rent.png",
		button: "Search",
	},
	{
		title: "Sell",
		description: "Post your Porperty Easily",
		image: "assets/sell.png",
		button: "Join as an Agent / Landlord",
	},
];

const icons = [
	{
		image:"assets/material-symbols_verified-outline-rounded.png",
		title: "Verified Listing",
	},
	{
		image:"assets/fluent-mdl2_payment-card.png",
		title: "Escrow Payment"
	},
	{
		image:"assets/uil_building.png",
		title: "Lagos Insights",
	},
	{
		image: "assets/Vector.png",
		title:"Facility Management",
	},
];



const Body = () => {
  return (
    <div>
			<img src="/assets/home.png" className="w-full mb-10px"/>
			
			<div className="container mx-auto mb-10 py-10 border-2 border-blue-400">
				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 pb-15">
					{options.map((item, index) =>{
						return (
							<div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:translate-y-1 transition-all duration-300">
								<img src={item.image} alt={item.title} className="w-full h-48 object-cover"/>
								<div className="p-6">
										<h3 className="text-xl font-semibold mb-2">{item.title}</h3>
										<p className="text-gray-600 text-sm mb-6">{item.description}</p>
										<button className="px-5 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-900 text-sm">{item.button}</button>
								</div>
							</div>
						)
					})}
				</div>

				<div className="mb-20">
					<h1 className="text-4xl font-bold pb-14">Why Choose Home Buddy ?</h1>
					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 items-center space-x-4 mb-4 text-center">
						{icons.map((icon, index)=>{
							return (
								<div key={index} className="flex flex-col items-center justify-center gap-4 ">
									<div className="h-14 w-14 rounded-full border-2 border-gren-300 bg-green-200 flex flex-col items-center justify-center">
										<img src={icon.image} className="h-7 w-7"/>
									</div>
									<p className="text-gray-600 text-sm font-semibold">{icon.title}</p>
								</div>
								
							)
						})}
					</div>
				</div>	

			</div>



    </div>
    

  )
}

export default Body