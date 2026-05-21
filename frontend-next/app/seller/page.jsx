'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../lib/api';
import UserAvatar from '../components/UserAvatar';

const reasons = [
  { key: 'verified', label: 'Verified listings', icon: '/icons/verified.svg' },
  { key: 'escrow', label: 'Escrow payment', icon: '/icons/escrow.svg' },
  { key: 'insights', label: 'Lagos insights', icon: '/icons/insights.svg' },
  { key: 'facility', label: 'Facility management', icon: '/icons/facility.svg' },
];

export default function SellerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const response = await authFetch(`${API_BASE_URL}/user/me`, {
        method: 'GET',
      });

      if (!response) {
        if (mounted) setLoadingUser(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (!mounted) return;

      if (response.status === 200 && data?.payload) {
        setUser(data.payload);
      } else {
        redirectToLogin();
      }

      setLoadingUser(false);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });

      const data = await response.json().catch(() => null);

      if (response.status === 200) {
        // Logout successful, redirect to login
        router.push('/login');
      } else {
        // Show error from backend
        const errorMsg = data?.message || 'Logout failed. Please try again.';
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);

    try {
      const response = await authFetch(
        `${API_BASE_URL}/properties/search?q=${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET',
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 200 && data?.payload) {
        setSearchResults(data.payload);
      } else {
        setSearchResults([]);
        const errorMsg = data?.message || 'Failed to search listings.';
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search listings. Please try again.');
      setSearchResults([]);
    }

    setSearching(false);
  };

  const displayName = useMemo(() => {
    if (!user) return 'Loading';

    const first = user.first_name || '';
    const last = user.last_name || '';
    const full = `${first} ${last}`.trim();

    if (full) return full;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  }, [user]);

  const userImageUrl = user?.image_url || '';

  const handleBrandClick = () => {
    if (!user) return;
    const role = user.role || 'seller';
    const dashboardRoutes = {
      seller: '/seller',
      buyer: '/buyer',
      agent: '/agent',
    };
    const dashboardUrl = dashboardRoutes[role.toLowerCase()] || '/seller';
    router.push(dashboardUrl);
  };

  return (
    <main className="page-shell seller-page-shell">
      <header className="topbar seller-topbar">
        <button
          type="button"
          className="brand-lockup brand-lockup--clickable"
          onClick={handleBrandClick}
          aria-label="Home Buddy dashboard"
          disabled={!user || loadingUser}
        >
          <img src="/home_buddy_logo.png" alt="Home Buddy" className="brand-logo" />
          <div>
            <div className="brand-name">Home Buddy</div>
            <div className="brand-tagline">Verified housing platform</div>
          </div>
        </button>

        <div className="topbar-tags" aria-hidden="true">
          <span>Sell</span>
          <span>Agents</span>
          <span>Facility Mgt</span>
        </div>

        <div
          className="seller-user-menu"
          onMouseEnter={() => setHoverOpen(true)}
          onMouseLeave={() => setHoverOpen(false)}
          onFocus={() => setHoverOpen(true)}
          onBlur={() => setHoverOpen(false)}
        >
          <button
            type="button"
            className="profile-trigger"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen || hoverOpen}
            aria-haspopup="menu"
          >
            <UserAvatar src={userImageUrl} name={displayName} size="sm" className="profile-avatar-shell" />
            <span className="profile-name">{loadingUser ? 'Loading...' : displayName}</span>
            <span className="profile-caret" aria-hidden="true">▾</span>
          </button>

          <div
            className={`profile-dropdown ${dropdownOpen || hoverOpen ? 'profile-dropdown--open' : ''}`}
            role="menu"
            aria-hidden={! (dropdownOpen || hoverOpen)}
          >
            <div className="profile-dropdown-header">
              <UserAvatar src={userImageUrl} name={displayName} size="lg" className="profile-dropdown-avatar-shell" />
              <strong>{displayName}</strong>
            </div>
            <button type="button" className="profile-dropdown-item" role="menuitem">Dashboard</button>
            <button type="button" className="profile-dropdown-item" role="menuitem">Messages</button>
            <button
              type="button"
              className="profile-dropdown-item"
              role="menuitem"
              onClick={() => router.push('/seller/profile-settings')}
            >
              Profile Settings
            </button>
            <button type="button" className="profile-dropdown-item" role="menuitem">Switch to Buying Account</button>
            <button
              type="button"
              className="profile-dropdown-item"
              role="menuitem"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-copy">
          <h1>Manage Your Listings</h1>

          <form className="search-bar-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search for listings (houses, lands, apartments...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search listings"
            />
            <button type="submit" className="search-button" disabled={searching} aria-label="Search">
              {searching ? 'Searching...' : '⌕'}
            </button>
          </form>
        </div>
      </section>

      {searchResults.length > 0 && (
        <section className="search-results">
          <h2>Search Results</h2>
          <div className="property-strip">
            {searchResults.map((property) => (
              <article className="property-card" key={property.id || property.name}>
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
      )}

      <section className="cards-grid seller-cards" aria-label="Seller tools">
        <article
          className="info-card info-card--dark"
          role="button"
          tabIndex={0}
          onClick={() => router.push('/seller/listings/new')}
          onKeyDown={(e) => { if (e.key === 'Enter') router.push('/seller/listings/new'); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-image" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80"
              alt="Sell property"
              className="card-image-img"
            />
          </div>
          <div className="card-body">
            <h2>Sell</h2>
            <p>List your property easily and reach verified buyers</p>
            <button type="button" className="action-button" onClick={() => router.push('/seller/listings/new')}>List a Property</button>
          </div>
        </article>
        <article
          className="info-card info-card--dark"
          role="button"
          tabIndex={0}
          onClick={() => router.push('/seller/listings')}
          onKeyDown={(e) => { if (e.key === 'Enter') router.push('/seller/listings'); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-image" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80"
              alt="My listings"
              className="card-image-img"
            />
          </div>
          <div className="card-body">
            <h2>My Listings</h2>
            <p>View and manage all your property listings</p>
            <button type="button" className="action-button" onClick={() => router.push('/seller/listings')}>View Listings</button>
          </div>
        </article>
        <article
          className="info-card info-card--dark"
          role="button"
          tabIndex={0}
          onClick={() => router.push('/seller/messages')}
          onKeyDown={(e) => { if (e.key === 'Enter') router.push('/seller/messages'); }}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-image" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80"
              alt="Messages"
              className="card-image-img"
            />
          </div>
          <div className="card-body">
            <h2>Messages</h2>
            <p>Respond to buyer inquiries and messages</p>
            <button type="button" className="action-button" onClick={() => router.push('/seller/messages')}>View Messages</button>
          </div>
        </article>
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
