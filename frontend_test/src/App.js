import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, CheckCircle, Wallet, Shield, Wrench, ChevronLeft, ChevronRight, Star, Smartphone, Menu } from 'lucide-react';
import LoginPage from './LoginPage';

// --- Components ---

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white shadow-sm sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-primary text-white p-1 rounded">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
        </div>
        <span className="font-bold text-xl text-dark">HomeBuddy</span>
      </Link>
      
      <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
        <Link to="/" className="hover:text-primary">Buy</Link>
        <Link to="/" className="hover:text-primary">Rent</Link>
        <Link to="/" className="hover:text-primary">Sell</Link>
        <Link to="/" className="hover:text-primary">Agents</Link>
        <Link to="/" className="hover:text-primary">Services</Link>
      </div>

      <button 
        onClick={() => navigate('/login')} 
        className="bg-dark text-white px-5 py-2 rounded text-sm font-medium hover:bg-gray-800"
      >
        Join / Sign In
      </button>
    </nav>
  );
};

const Hero = () => (
  <div className="relative h-[500px] w-full bg-gray-900 flex items-center justify-center">
    <img 
      src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
      alt="Modern Apartment" 
      className="absolute inset-0 w-full h-full object-cover opacity-60"
    />
    
    <div className="relative z-10 w-full max-w-4xl px-4 text-center md:text-left">
      <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
        Find Your Perfect Home in Lagos <br />
        Faster, Easier, and Safer
      </h1>
      
      <div className="bg-white p-2 rounded-lg flex flex-col md:flex-row gap-2 max-w-xl">
        <div className="flex-1 flex items-center px-3 border-r border-gray-200">
          <MapPin className="text-gray-400 w-5 h-5 mr-2" />
          <input 
            type="text" 
            placeholder="Where do you want to live?" 
            className="w-full outline-none text-gray-700 py-2"
          />
        </div>
        <button className="bg-dark text-white px-8 py-3 rounded md:w-auto w-full font-medium flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Search
        </button>
      </div>
    </div>
  </div>
);

const ServiceCard = ({ image, title, desc, btnText }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div className="h-40 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover" />
    </div>
    <div className="p-5">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-4">{desc}</p>
      <button className="bg-dark text-white text-xs px-4 py-2 rounded">{btnText}</button>
    </div>
  </div>
);

const FeatureIcon = ({ icon: Icon, title }) => (
  <div className="flex flex-col items-center text-center gap-3">
    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-primary">
      <Icon size={24} />
    </div>
    <span className="text-sm font-semibold text-gray-800">{title}</span>
  </div>
);

const PropertyCard = ({ image, price, title, address, beds, baths, sqft }) => (
  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden min-w-[280px]">
    <div className="relative h-48">
      <img src={image} alt={title} className="w-full h-full object-cover" />
      <span className="absolute top-3 left-3 bg-white px-2 py-1 rounded text-xs font-bold text-dark">FOR SALE</span>
    </div>
    <div className="p-4">
      <h3 className="text-primary font-bold text-lg mb-1">{price}</h3>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
        <MapPin size={12} /> {address}
      </p>
      <div className="flex justify-between border-t border-gray-100 pt-3 text-xs text-gray-600">
        <span>{beds} Beds</span>
        <span>{baths} Baths</span>
        <span>{sqft} Sqft</span>
      </div>
    </div>
  </div>
);

const AgentCard = ({ image, name, role, rating }) => (
  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
    <img src={image} alt={name} className="w-14 h-14 rounded-full object-cover" />
    <div>
      <h4 className="font-bold text-gray-900">{name}</h4>
      <p className="text-xs text-gray-500 mb-1">{role}</p>
      <div className="flex items-center text-yellow-400 text-xs font-bold gap-1">
        <Star size={12} fill="currentColor" /> {rating} <span className="text-gray-400 font-normal">Review</span>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-gray-900 text-white pt-16 pb-8 px-6 md:px-12">
    <div className="grid md:grid-cols-4 gap-8 mb-12">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-white text-dark p-1 rounded">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
          </div>
          <span className="font-bold text-xl">HomeBuddy</span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          HomeBuddy is your best partner when buying, renting, or selling properties. We ensure a seamless experience with verified listings and expert agents.
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-4 text-gray-200">SERVICES</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>Buy</li>
          <li>Rent</li>
          <li>Sell</li>
          <li>Agents</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4 text-gray-200">RESOURCES</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>About</li>
          <li>Contact</li>
          <li>FAQ</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4 text-gray-200">SUPPORT</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>Help Center</li>
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
        </ul>
      </div>
    </div>
    <div className="text-center text-gray-600 text-xs border-t border-gray-800 pt-8">
      © 2024 HomeBuddy. All rights reserved.
    </div>
  </footer>
);

// --- Pages ---

const Home = () => (
  <>
    <Navbar />
    <Hero />
    
    <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-3 gap-6">
        <ServiceCard 
          image="https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
          title="Buy"
          desc="Find your dream home with our curated listings."
          btnText="Browse Properties"
        />
        <ServiceCard 
          image="https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
          title="Rent"
          desc="Explore rental properties in your favorite areas."
          btnText="View Rentals"
        />
        <ServiceCard 
          image="https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
          title="Sell"
          desc="Sell your property quickly at the best market price."
          btnText="List Property"
        />
      </div>
    </section>

    <section className="px-6 md:px-12 py-8 bg-white">
      <h2 className="text-2xl font-bold mb-10 text-center md:text-left">Why Choose Home Buddy</h2>
      <div className="flex flex-wrap justify-between gap-8 md:gap-4 max-w-5xl">
          <FeatureIcon icon={CheckCircle} title="Verified Listings" />
          <FeatureIcon icon={Wallet} title="Price Negotiation" />
          <FeatureIcon icon={Shield} title="Legal Support" />
          <FeatureIcon icon={Wrench} title="Facility Management" />
      </div>
    </section>

    <section className="px-6 md:px-12 py-16 bg-gray-50">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Featured Properties</h2>
          <div className="flex gap-4 text-sm text-gray-500">
            <span className="text-dark font-semibold border-b-2 border-dark pb-1">Houses</span>
            <span>Apartments</span>
            <span>Villas</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"><ChevronLeft size={16} /></button>
          <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <PropertyCard 
          image="https://images.unsplash.com/photo-1600596542815-6ad4c727dd2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
          price="₦85,000,000" title="Luxury Family Home" address="Lekki Phase 1, Lagos" beds="4" baths="4" sqft="2500" 
        />
        <PropertyCard 
          image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
          price="₦120,000,000" title="Modern Villa" address="Ikoyi, Lagos" beds="5" baths="6" sqft="3200" 
        />
        <PropertyCard 
          image="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
          price="₦65,000,000" title="Cozy Apartment" address="Victoria Island, Lagos" beds="3" baths="3" sqft="1800" 
        />
        <PropertyCard 
          image="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
          price="₦45,000,000" title="Studio Apartment" address="Surulere, Lagos" beds="1" baths="1" sqft="600" 
        />
      </div>
    </section>

    <section className="px-6 md:px-12 py-16">
      <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Meet Verified Agents Near You</h2>
          <a href="#" className="text-sm underline text-gray-500">See all agents</a>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
          <AgentCard image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" name="Sarah Oladipo" role="Premium Agent" rating="4.9" />
          <AgentCard image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" name="David Okon" role="Real Estate Pro" rating="4.7" />
          <AgentCard image="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" name="Tanya Adebayo" role="Luxury Specialist" rating="5.0" />
      </div>
    </section>

    <section className="px-6 md:px-12 py-16">
      <div className="bg-light rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Coming Soon on Mobile</h2>
              <p className="text-gray-600 mb-8 max-w-md">Get instant notifications, virtual tours, and chat with agents directly from your phone. The HomeBuddy app makes house hunting simpler.</p>
              <div className="flex gap-4">
                  <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <Smartphone size={20} /> <span className="text-xs text-left">Get it on <br/><span className="text-sm font-bold">Google Play</span></span>
                  </button>
                  <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <Smartphone size={20} /> <span className="text-xs text-left">Download on the <br/><span className="text-sm font-bold">App Store</span></span>
                  </button>
              </div>
          </div>
          <div className="md:w-1/3 flex justify-center">
              <div className="border-8 border-gray-800 rounded-[2.5rem] overflow-hidden h-80 w-48 bg-white shadow-xl relative flex items-center justify-center">
                  <div className="absolute top-0 w-32 h-6 bg-gray-800 rounded-b-xl"></div>
                  <div className="text-center">
                      <div className="flex justify-center text-primary mb-2">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                      </div>
                      <h3 className="font-bold text-lg">HomeBuddy</h3>
                      <p className="text-xs text-gray-500">Mobile App</p>
                  </div>
              </div>
          </div>
      </div>
    </section>

    <section className="text-center py-16 px-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-3">Start your next move today</h2>
      <h3 className="text-xl md:text-2xl text-gray-600 mb-6">Buy, Rent, or Sell with Confidence</h3>
      <button className="bg-dark text-white px-8 py-3 rounded hover:bg-gray-800 transition">Get Started</button>
    </section>

    <Footer />
  </>
);

// --- Main Router App ---

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

export default App;