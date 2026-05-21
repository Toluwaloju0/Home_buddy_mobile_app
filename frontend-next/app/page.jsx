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
    price: 'N1,000,000',
    location: 'Lekki Phase 1, Lagos',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Maitama Comfort Flat',
    price: 'N1,200,000',
    location: 'Yaba, Lagos',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Island View Apartment',
    price: 'N900,000',
    location: 'Victoria Island, Lagos',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Epe Garden Land',
    price: 'N1,000,000',
    location: 'Epe, Lagos',
    image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1600&q=80',
  },
];

const agents = [
  {
    name: 'Chika Nwosu',
    role: 'Greenfield Realty',
    stats: '128 reviews · 42 properties listed',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Kunle Adebayo',
    role: 'PrimeEdge Properties',
    stats: '94 reviews · 37 properties listed',
    image: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Sarah Johnson',
    role: 'LandLink Ltd.',
    stats: '77 reviews · 60 properties listed',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=400&q=80',
  },
];

function StaticActionButton({ children, tone = 'dark' }) {
  return (
    <button
      type="button"
      disabled
      className={`static-action static-action--${tone}`}
      aria-hidden="true"
      tabIndex={-1}
    >
      {children}
    </button>
  );
}

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-lockup" aria-label="Home Buddy">
          <img src="/home_buddy_logo.png" alt="Home Buddy" className="brand-logo" />
          <div>
            <div className="brand-name">Home Buddy</div>
            <div className="brand-tagline">Verified housing platform</div>
          </div>
        </div>

        <a className="join-button" href="/login">
          Join / Sign in
        </a>
      </header>

      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-copy">
          <p className="eyebrow">Trusted real estate, built for Nigeria</p>
          <h1>Find Your Perfect Home In Lagos Faster, Easier, and Safer</h1>
          <p>
            Browse verified properties, compare total move-in cost, and enter the platform through a single secure
            login path.
          </p>

          <div className="search-bar" aria-hidden="true">
            <span className="search-pill">Buy</span>
            <span className="search-divider" />
            <span className="search-placeholder">Current location</span>
            <span className="search-icon">⌕</span>
          </div>
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
              <StaticActionButton tone={card.tone === 'dark' ? 'dark' : 'light'}>{card.cta}</StaticActionButton>
            </div>
          </article>
        ))}
      </section>

      <section className="why-section">
        <h2>Why Choose Home Buddy</h2>
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

      <section className="featured-section">
        <div className="section-heading">
          <h2>Featured Properties</h2>
          <div className="filter-tabs" aria-hidden="true">
            <span className="active">For Sale</span>
            <span>For Rent</span>
            <span>Short Lets</span>
            <span>Shops</span>
            <span>Lands</span>
          </div>
        </div>

        <div className="property-strip" aria-label="Featured properties">
          {properties.map((property) => (
            <article className="property-card" key={property.name}>
              <div className="property-photo" aria-hidden="true">
                <img src={property.image} alt={property.name} className="property-photo-image" />
              </div>
              <div className="property-copy">
                <h3>{property.name}</h3>
                <strong>{property.price}</strong>
                <p>{property.location}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="agents-section">
        <div className="section-heading agents-header">
          <h2>Meet Verified Agents Near You</h2>
          <span aria-hidden="true">View All Agents</span>
        </div>

        <div className="agents-grid">
          {agents.map((agent) => (
            <article className="agent-card" key={agent.name}>
              <div className="agent-avatar" aria-hidden="false">
                <img src={agent.image} alt={agent.name} className="agent-avatar-image" />
              </div>
              <div>
                <h3>{agent.name}</h3>
                <p>{agent.role}</p>
                <span>{agent.stats}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mobile-banner">
        <div>
          <h2>Coming Soon on Mobile</h2>
          <p>
            Experience Home Buddy on the go. Buy, rent, sell, or manage properties from your phone.
          </p>
          <div className="store-badges" aria-hidden="true">
            <div className="store-badge">Google Play</div>
            <div className="store-badge">App Store</div>
          </div>
        </div>
        <div className="phone-mock" aria-hidden="true">
          <div className="phone-screen">
            <div className="phone-logo" />
            <div className="phone-title">Home Buddy</div>
            <div className="phone-subtitle">Your trusted companion for better living</div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <h2>Start your next move today</h2>
        <p>Buy, Rent, or Sell with Confidence</p>
        <a className="join-button join-button--center" href="/login">
          Join / Sign in
        </a>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-lockup brand-lockup--footer" aria-label="Home Buddy">
              <img src="/home_buddy_logo.png" alt="Home Buddy" className="brand-logo" />
              <div>
                <div className="brand-name">Home Buddy</div>
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
          <div className="footer-copy">© 2026 Home Buddy. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
