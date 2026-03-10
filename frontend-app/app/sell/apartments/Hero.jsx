import { Button } from "@/components/ui/button"

const Hero = () => {
  return (
    <section className="relative w-full h-[300px] sm:h-[420px] md:h-[480px] lg:h-[520px] bg-cover bg-center" style={{ backgroundImage: "url('/assets/ikorodu_apartment-1.jpg')" }}>
      {/* Content container */}
      <div className="absolute top-16 sm:top-[120px] md:top-[140px] lg:top-[160px] mx-auto w-full px-4 sm:px-8 lg:px-30 text-center">
        <div className="bg-white py-4 px-4 sm:py-6 md:py-7 rounded-md mx-2 sm:mx-0">
          <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight sm:leading-snug">
          Sell Your Apartment with Home Buddy
          </h1>
          <p className="text-gray-500 text-sm md:text-base my-3 md:my-5">Connect with serious buyers and get the best value for your property</p>
          <Button className="px-4 py-3 md:px-6 md:py-6 text-white bg-[#243235] text-sm md:text-base">Get started</Button>
        </div>
      </div>
    </section>
  )
}

export default Hero