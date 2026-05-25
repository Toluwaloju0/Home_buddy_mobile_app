import Link from 'next/link';

const footerPrimaryLinks = [
  { label: 'Contact', href: '/contact' },
  { label: 'About Us', href: '/about-us' },
  { label: 'Our Services', href: '/services' },
  { label: 'Login', href: '/login' },
  { label: 'Register', href: '/signup' },
  { label: 'Support', href: '/support' },
];

const footerSecondaryLinks = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Careers', href: '/careers' },
];

export default function BuyerProfileLayout({ title, lead, children }) {
  return (
    <main className="page-shell settings-page-shell buyer-profile-shell">
      <header className="topbar settings-topbar buyer-profile-topbar">
        <Link className="brand-lockup brand-lockup--clickable" href="/buyer" aria-label="Buyer dashboard">
          <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
          <div>
            <div className="brand-name">Home Buddy Connect Limited</div>
            <div className="brand-tagline">Buyer profile center</div>
          </div>
        </Link>

        <Link className="join-button" href="/buyer">
          Buyer Dashboard
        </Link>
      </header>

      <section className="settings-hero buyer-profile-hero">
        <div>
          <p className="settings-kicker">Account management</p>
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>
      </section>

      {children}

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
              A trusted real estate platform for verified property discovery, buyer tools, and role-based dashboards.
            </p>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <ul className="footer-column">
              {footerPrimaryLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
            <ul className="footer-column">
              {footerSecondaryLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
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