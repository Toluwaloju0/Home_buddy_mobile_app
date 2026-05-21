import Searchbar from "./Searchbar";

const Hero = () => {
  return (
    <section className="relative w-full h-[420px] sm:h-[480px] md:h-[520px] bg-cover bg-center" style={{ backgroundImage: "url('assets/home.jpg')" }}>
      {/* Content container */}
      <div className="absolute top-[120px] sm:top-[140px] lg:top-[160px] w-full px-4 sm:px-8 lg:px-16 text-center sm:text-left">
        <h1 className="text-white font-bold text-3xl sm:text-4xl md:text-5xl leading-tight sm:leading-snug max-w-2xl mx-auto sm:mx-0">
          Find Your Perfect Home In Lagos <br />
          Faster, Easier, and Safer
        </h1>

        <div className="mt-6 sm:mt-8 max-w-xl mx-auto sm:mx-0">
          <Searchbar />
        </div>
      </div>
    </section>
  );
};

export default Hero;
