'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const menuItems = [
  {
    key: 'buy',
    label: 'Buy',
    role: 'buyer',
    items: ['Apartment', 'Land', 'Shop'],
  },
  {
    key: 'rent',
    label: 'Rent',
    role: 'buyer',
    items: ['Apartment', 'Land', 'Shop'],
  },
  {
    key: 'sell',
    label: 'Sell',
    role: 'seller',
    items: ['Apartment', 'Land', 'Shop'],
  },
];

export default function LandingHeader() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const navLinkClassName = useMemo(() => 'landing-nav-link', []);

  const goToSignup = (role) => {
    router.push(`/signup?role=${role}`);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (key) => {
    setOpenDropdown((current) => (current === key ? null : key));
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((current) => !current);
    setOpenDropdown(null);
  };

  const renderMenuItem = (item, mobile = false) => {
    const isOpen = openDropdown === item.key;

    return (
      <div key={item.key} className={`landing-nav-item ${mobile ? 'landing-nav-item--mobile' : ''}`}>
        <div className="landing-nav-item-row">
          <button
            type="button"
            className="landing-nav-main-button"
            onClick={() => goToSignup(item.role)}
          >
            {item.label}
          </button>
          <button
            type="button"
            className="landing-nav-arrow-button"
            onClick={() => toggleDropdown(item.key)}
            aria-expanded={isOpen}
            aria-label={`Toggle ${item.label} options`}
          >
            ▾
          </button>
        </div>

        <div className={`landing-dropdown ${isOpen ? 'landing-dropdown--open' : ''}`}>
          {item.items.map((choice) => (
            <button
              key={choice}
              type="button"
              className="landing-dropdown-item"
              onClick={() => goToSignup(item.role)}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    );
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
          {menuItems.map((item) => renderMenuItem(item))}

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
            Signup
          </Link>
        </div>

        <div className="landing-mobile-menu" aria-label="Mobile navigation links">
          {menuItems.map((item) => renderMenuItem(item, true))}

          <Link className="landing-nav-link landing-nav-link--mobile" href="/search" onClick={() => setMobileMenuOpen(false)}>
            Search
          </Link>

          <button type="button" className="landing-nav-link landing-nav-link--disabled landing-nav-link--mobile" disabled>
            Agents
          </button>

          <div className="landing-mobile-auth">
            <Link className="join-button" href="/login" onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
            <Link className="join-button join-button--secondary" href="/signup" onClick={() => setMobileMenuOpen(false)}>
              Signup
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
