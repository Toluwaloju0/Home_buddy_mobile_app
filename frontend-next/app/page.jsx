const featureCards = [
  {
    title: 'Buy',
    description: 'Featured homes, lands, and shops ready for verified buyers.',
    cta: 'Search listings',
    tone: 'light',
  },
  {
    title: 'Rent',
    description: 'Short lets and long stays with clear fees and upfront details.',
    cta: 'Browse rentals',
    tone: 'mint',
  },
  {
    title: 'Sell',
    description: 'List a property and move through verification before it goes live.',
    cta: 'Join as seller',
    tone: 'dark',
  },
];

const reasons = [
  'Verified listings',
  'Escrow payment',
  'Lagos insights',
  'Facility management',
];

const properties = [
  {
    name: 'Lekki Luxury Apartment',
    price: 'N1,000,000',
    location: 'Lekki Phase 1, Lagos',
  },
  {
    name: 'Maitama Comfort Flat',
    price: 'N1,200,000',
    location: 'Yaba, Lagos',
  },
  {
    name: 'Island View Apartment',
    price: 'N900,000',
    location: 'Victoria Island, Lagos',
  },
  {
    name: 'Epe Garden Land',
    price: 'N1,000,000',
    location: 'Epe, Lagos',
  },
];

const agents = [
  {
    name: 'Chika Nwosu',
    role: 'Greenfield Realty',
    stats: '128 reviews · 42 properties listed',
  },
  {
    name: 'Kunle Adebayo',
    role: 'PrimeEdge Properties',
    stats: '94 reviews · 37 properties listed',
  },
  {
    name: 'Sarah Johnson',
    role: 'LandLink Ltd.',
    stats: '77 reviews · 60 properties listed',
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
          <span className="brand-mark" />
          <div>
            <div className="brand-name">Home Buddy</div>
            <div className="brand-tagline">Verified housing platform</div>
          </div>
        </div>

        <div className="topbar-tags" aria-hidden="true">
          <span>Buy</span>
          <span>Rent</span>
          <span>Sell</span>
          <span>Agents</span>
          <span>Facility Mgt</span>
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
            <div className="card-image" aria-hidden="true" />
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
            <div className="reason-item" key={reason}>
              <span className="reason-icon" />
              <span>{reason}</span>
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
              <div className="property-photo" aria-hidden="true" />
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
              <div className="agent-avatar" aria-hidden="true" />
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
        <div className="footer-brand">
          <div className="brand-lockup brand-lockup--footer" aria-label="Home Buddy">
            <span className="brand-mark" />
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
        <div className="footer-copy">© 2026 Home Buddy. All rights reserved.</div>
      </footer>
    </main>
  );
}
