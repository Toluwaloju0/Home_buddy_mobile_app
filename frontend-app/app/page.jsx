/* 

import FeaturedProperties from "@/components/FeaturedProperties";
import Hero from "@/components/Hero";
import Verifiedagents from "@/components/Verifiedagents";


 

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

 const Home = () => {
   return (
    <div className="min-h-screen">
			<Hero />
			<div className="container mx-auto mb-10 py-10 px-10 border-2 border-blue-400">
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
					<h1 className="text-4xl font-bold pb-5 lg:pb-12">Why Choose Home Buddy ?</h1>
					<div className="grid gap-4 lg:gap-8 sm:grid-cols-2 lg:grid-cols-4 items-center mb-4 text-center">
						{icons.map((icon, index)=>{
							return (
								<div key={index} className="flex flex-col items-center justify-center gap-4 border-2 border-red-300">
									<div className="h-14 w-14 rounded-full bg-green-200 flex flex-col items-center justify-center">
										<img src={icon.image} className="h-7 w-7"/>
									</div>
									<p className="text-gray-600 text-sm font-semibold">{icon.title}</p>
								</div>
								
							)
						})}
					</div>
				</div>	
        <FeaturedProperties />
				<Verifiedagents />
			</div>
    </div>
   )
 }
 
 export default Home */

import FeaturedProperties from "@/components/FeaturedProperties";
import Hero from "@/components/Hero";
import Verifiedagents from "@/components/Verifiedagents";
import Footer from "@/components/Footer";

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
    description: "Post your Property Easily",
    image: "assets/sell.png",
    button: "Join as an Agent / Landlord",
  },
];

const icons = [
  {
    image: "assets/material-symbols_verified-outline-rounded.png",
    title: "Verified Listing",
  },
  {
    image: "assets/fluent-mdl2_payment-card.png",
    title: "Escrow Payment"
  },
  {
    image: "assets/uil_building.png",
    title: "Lagos Insights",
  },
  {
    image: "assets/Vector.png",
    title: "Facility Management",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-10">
        {/* Options Section */}
        <div className="mb-12 md:mb-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {options.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">{item.description}</p>
                  <button className="px-6 py-3 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-900 active:scale-95 transition-all duration-200 text-sm md:w-full">
                    {item.button}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Section */}
        <div className="mb-16 md:mb-20">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-12 text-center text-gray-800">
            Why Choose Home Buddy?
          </h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {icons.map((icon, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center justify-center p-5 md:p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              >
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-green-50 flex items-center justify-center mb-4 p-3">
                  <img src={icon.image} className="h-8 w-8 md:h-10 md:w-10 object-contain"  />
                </div>
                <p className="text-gray-700 text-base md:text-lg font-semibold text-center">
                  {icon.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Properties Section */}
        <div className="mb-16 md:mb-20">
          <FeaturedProperties />
        </div>

        {/* Verified Agents Section */}
        <div>
          <Verifiedagents />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home; 