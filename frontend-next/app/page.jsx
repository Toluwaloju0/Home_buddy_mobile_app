const featureCards = [
  {
    title: 'Buy',
    description: 'Featured homes, lands, and shops ready for verified buyers.',
    cta: 'Search listings',
    tone: 'light',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Rent',
    description: 'Short lets and long stays with clear fees and upfront details.',
    cta: 'Browse rentals',
    tone: 'mint',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Sell',
    description: 'List a property and move through verification before it goes live.',
    cta: 'Join as seller',
    tone: 'dark',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  },
];

const reasons = [
  { key: 'verified', label: 'Verified listings', icon: '/icons/verified.svg' },
  { key: 'escrow', label: 'Escrow payment', icon: '/icons/escrow.svg' },
  { key: 'insights', label: 'Lagos insights', icon: '/icons/insights.svg' },
  { key: 'facility', label: 'Facility management', icon: '/icons/facility.svg' },
];

const properties = [
  {
    name: 'Lekki Luxury Apartment',
    location: 'Lekki Phase 1, Lagos',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Maitama Comfort Flat',
    location: 'Yaba, Lagos',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Island View Apartment',
    location: 'Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Epe Garden Land',
    location: 'Epe, Lagos',
    image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1600&q=80',
  },
];

const testimonials = [
  {
    text: 'Home Buddy helped me find a verified apartment quickly; the process was smooth and trustworthy.',
    name: 'Aisha Bello',
  },
  {
    text: 'I sold my shop without headaches. The escrow feature gave me peace of mind throughout the sale.',
    name: 'Chukwu Emeka',
  },
  {
    text: 'Their team handled everything professionally — highly recommended to anyone looking for verified listings.',
    name: 'Ngozi Okafor',
  },
];

import SearchBar from './components/SearchBar';
import SearchPopout from './components/SearchPopout';
import FeaturedProperties from './components/FeaturedProperties';
import LandingHeader from './components/LandingHeader';

export default function HomePage() {
  return (
    <main className="page-shell">
      <LandingHeader />

      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-copy">
          <p className="eyebrow">Trusted real estate, built for Nigeria</p>
          <h1>Find Your Perfect Home In Nigeria Faster, Easier, and Safer</h1>
          <p>
            Home Buddy Connect Limited Provides Real Estate And Property services Including Renting, Leasing, Buying, And Selling Of Verified Residential And 
            Commercial Properties, Along With Facility Management And Integrated Waste Management Solutions To Ensure Safe, Clean And Well-maintained Environments
          </p>

          <SearchBar />
        </div>
      </section>

      <section className="cards-grid" aria-label="Primary property journeys">
        {featureCards.map((card) => (
          <article className={`info-card info-card--${card.tone}`} key={card.title}>
            <div className="card-image" aria-hidden="true">
              <img src={card.image} alt={card.title} className="card-image-img" />
            </div>
            <div className="card-body">
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              {card.title === 'Buy' ? (
                <SearchPopout tone={card.tone === 'dark' ? 'dark' : 'light'}>{card.cta}</SearchPopout>
              ) : card.title === 'Rent' ? (
                <a className={`static-action static-action--${card.tone === 'dark' ? 'dark' : 'light'}`} href="/rentals">{card.cta}</a>
              ) : (
                <a className={`static-action static-action--${card.tone === 'dark' ? 'dark' : 'light'}`} href="/signup?role=seller">{card.cta}</a>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="why-section">
        <h2>Why Choose Home Buddy Connect Limited</h2>
        <div className="reason-row" aria-hidden="true">
          {reasons.map((reason) => (
            <div className="reason-item" key={reason.key}>
              <div className="reason-icon" aria-hidden="true">
                <img src={reason.icon} alt="" className="reason-icon-image" />
              </div>
              <span>{reason.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2>About Us</h2>
        <div className="about-body">
          <p>
            Home Buddy is a modern real estate platform helping people find verified homes easily, safely and
            stress-free. We combine smart technology with trusted property solutions to simplify housing, reduce
            fraud, and improve the way people live.
          </p>

          <div className="mission-vision">
            <article className="mission">
              <h3>Our Mission</h3>
              <p>
                To simplify property search and management by providing verified listings, trusted connections and
                seamless digital solutions.
              </p>
            </article>

            <article className="vision">
              <h3>Our Vision</h3>
              <p>
                To become Nigeria's most trusted smart and real estate platform, transforming how people find and
                manage homes through technology, transparency and convenience.
              </p>
            </article>
          </div>
        </div>
      </section>

      <FeaturedProperties />

      <section className="mobile-banner">
        <div>
          <h2>Coming Soon on Mobile</h2>
          <p>
            Experience Home Buddy Connect Limited on the go. Buy, rent, sell, or manage properties from your phone.
          </p>
          <div className="store-badges" aria-hidden="true">
            <div className="store-badge">Google Play</div>
            <div className="store-badge">App Store</div>
          </div>
        </div>
        <div className="phone-mock" aria-hidden="true">
          <div className="phone-screen">
            <div className="phone-logo" />
            <div className="phone-title">Home Buddy Connect Limited</div>
            <div className="phone-subtitle">Your trusted companion for better living</div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <h2>Start your next move today</h2>
        <p>Buy, Rent, or Sell with Confidence</p>
        <div className="auth-action-group auth-action-group--center" aria-label="Account actions">
          <a className="join-button join-button--center" href="/signup">
            Join
          </a>
          <a className="join-button join-button--center join-button--secondary" href="/login">
            Sign in
          </a>
        </div>
      </section>

      <section className="testimonials-section">
        <h2>Why Users Trust Home Buddy</h2>
        <div className="testimonial-grid" aria-label="User testimonials">
          {testimonials.map((t) => (
            <article className="testimonial-card" key={t.name}>
              <blockquote className="testimonial-quote">
                <p>“{t.text}”</p>
              </blockquote>
              <div className="testimonial-author">— {t.name}</div>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-lockup brand-lockup--footer" aria-label="Home Buddy Connect Limited">
              <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
              <div>
                <div className="brand-name">Home Buddy Connect Limited</div>
                <div className="brand-tagline">Verified housing platform</div>
              </div>
            </div>
            <p>
              A trusted real estate platform for verified property discovery, seller onboarding, and role-based
              dashboards.
            </p>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <ul className="footer-column">
              <li><a href="/contact">Contact</a></li>
              <li><a href="/about-us">About Us</a></li>
              <li><a href="/services">Our Services</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/signup">Register</a></li>
              <li><a href="/support">Support</a></li>
            </ul>
            <ul className="footer-column">
              <li><a href="/terms">Terms</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/sitemap">Sitemap</a></li>
              <li><a href="/careers">Careers</a></li>
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">© 2026 Home Buddy Connect Limited. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
