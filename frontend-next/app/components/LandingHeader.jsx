'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClassName = useMemo(() => 'landing-nav-link', []);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((current) => !current);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="topbar landing-topbar">
      <div className="landing-header-main">
        <Link className="brand-lockup landing-brand-lockup" href="/" aria-label="Home Buddy Connect Limited">
          <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
          <div>
            <div className="brand-name">Home Buddy Connect Limited</div>
            <div className="brand-tagline">Verified housing platform</div>
          </div>
        </Link>

        <button
          type="button"
          className="landing-mobile-toggle"
          onClick={handleMobileMenuToggle}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>

      <nav className={`landing-nav ${mobileMenuOpen ? 'landing-nav--open' : ''}`} aria-label="Primary navigation">
        <div className="landing-nav-center">
          <Link className={navLinkClassName} href="/signup?role=buyer">
            Buy
          </Link>

          <Link className={navLinkClassName} href="/signup?role=buyer">
            Rent
          </Link>

          <Link className={navLinkClassName} href="/signup?role=seller">
            Sell
          </Link>

          <Link className={navLinkClassName} href="/search">
            Search
          </Link>

          <button type="button" className="landing-nav-link landing-nav-link--disabled" disabled>
            Agents
          </button>
        </div>

        <div className="auth-action-group landing-auth-actions" aria-label="Account actions">
          <Link className="join-button" href="/login">
            Login
          </Link>
          <Link className="join-button join-button--secondary" href="/signup">
            Sign up
          </Link>
        </div>

        <div className="landing-mobile-menu" aria-label="Mobile navigation links">
          <Link className="landing-nav-link landing-nav-link--mobile" href="/signup?role=buyer" onClick={handleNavClick}>
            Buy
          </Link>

          <Link className="landing-nav-link landing-nav-link--mobile" href="/signup?role=buyer" onClick={handleNavClick}>
            Rent
          </Link>

          <Link className="landing-nav-link landing-nav-link--mobile" href="/signup?role=seller" onClick={handleNavClick}>
            Sell
          </Link>

          <Link className="landing-nav-link landing-nav-link--mobile" href="/search" onClick={handleNavClick}>
            Search
          </Link>

          <button type="button" className="landing-nav-link landing-nav-link--disabled landing-nav-link--mobile" disabled>
            Agents
          </button>

          <div className="landing-mobile-auth">
            <Link className="join-button" href="/login" onClick={handleNavClick}>
              Login
            </Link>
            <Link className="join-button join-button--secondary" href="/signup" onClick={handleNavClick}>
              Sign up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
