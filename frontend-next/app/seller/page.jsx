'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../lib/api';
import UserAvatar from '../components/UserAvatar';

const reasons = ['Verified Listing', 'Escrow Payment', 'Lagos Insights', 'Facility Management'];

export default function SellerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  return (
    <main className="page-shell seller-page-shell">
      <header className="topbar seller-topbar">
        <div className="brand-lockup" aria-label="Home Buddy">
          <span className="brand-mark" />
          <div>
            <div className="brand-name">Home Buddy</div>
            <div className="brand-tagline">Verified housing platform</div>
          </div>
        </div>

        <div className="topbar-tags" aria-hidden="true">
          <span>Sell</span>
          <span>Agents</span>
          <span>Facility Mgt</span>
        </div>

        <div className="seller-user-menu">
          <button
            type="button"
            className="profile-trigger"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
          >
            <UserAvatar src={userImageUrl} name={displayName} size="sm" className="profile-avatar-shell" />
            <span className="profile-name">{loadingUser ? 'Loading...' : displayName}</span>
            <span className="profile-caret" aria-hidden="true">▾</span>
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown" role="menu">
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
          )}
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
          <div className="card-image" aria-hidden="true" />
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
          <div className="card-image" aria-hidden="true" />
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
          <div className="card-image" aria-hidden="true" />
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
            <div className="reason-item" key={reason}>
              <span className="reason-icon" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
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
            Home Buddy is a trusted real estate platform that helps you sell verified properties with confidence.
          </p>
        </div>
        <div className="footer-copy">© 2026 Home Buddy. All rights reserved.</div>
      </footer>
    </main>
  );
}
