'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../lib/api';
import UserAvatar from '../../components/UserAvatar';

function ListingsContent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  useEffect(() => {
    let mounted = true;

    async function loadListings() {
      const response = await authFetch(`${API_BASE_URL}/seller/listings`, {
        method: 'GET',
      });

      if (!response) {
        if (mounted) setLoadingListings(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (!mounted) return;

      if (response.status === 200 && data?.payload) {
        setListings(data.payload);
      } else {
        console.error('Failed to load listings:', data?.message);
      }

      setLoadingListings(false);
    }

    loadListings();

    return () => {
      mounted = false;
    };
  }, []);

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

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });

      const data = await response.json().catch(() => null);

      if (response.status === 200) {
        router.push('/login');
      } else {
        alert(data?.message || 'Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

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

  const renderHeader = () => (
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

      <div className="seller-user-menu">
        <button
          type="button"
          className="profile-trigger"
          onClick={() => setDropdownOpen((previous) => !previous)}
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
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller')}>Dashboard</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/messages')}>Messages</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/profile-settings')}>Profile Settings</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/listings/new')}>Add Listing</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={handleLogout}>Log out</button>
          </div>
        )}
      </div>
    </header>
  );

  const renderFooter = () => (
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
  );

  const getThumbnailImage = (listing) => {
    // Try to get the first exterior image
    if (listing.media?.exterior_images?.[0]?.url) {
      return listing.media.exterior_images[0].url;
    }
    // Fallback to any available image
    for (const [, images] of Object.entries(listing.media || {})) {
      if (Array.isArray(images) && images[0]?.url) {
        return images[0].url;
      }
    }
    return '/placeholder.jpg';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_approval':
        return 'listing-status--pending';
      case 'active':
        return 'listing-status--active';
      case 'sold':
        return 'listing-status--sold';
      case 'draft':
        return 'listing-status--draft';
      default:
        return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_approval':
        return 'Pending Review';
      case 'active':
        return 'Active';
      case 'sold':
        return 'Sold';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  return (
    <main className="page-shell seller-page-shell">
      {renderHeader()}

      <section className="listings-container">
        <div className="listings-header">
          <h1>My Listings</h1>
          <Link href="/seller/listings/new" className="btn-primary">
            + Add New Listing
          </Link>
        </div>

        {loadingListings ? (
          <div className="listings-loading">Loading your listings...</div>
        ) : listings.length === 0 ? (
          <div className="listings-empty">
            <p>You haven't created any listings yet.</p>
            <Link href="/seller/listings/new" className="btn-primary">
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((listing) => (
              <Link
                key={listing._id}
                href={`/seller/listings/${listing._id}`}
                className="listing-card"
              >
                <div className="listing-card-image">
                  <img
                    src={getThumbnailImage(listing)}
                    alt={listing.title}
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  <span className={`listing-status ${getStatusColor(listing.status)}`}>
                    {getStatusLabel(listing.status)}
                  </span>
                </div>
                <div className="listing-card-content">
                  <h3>{listing.title}</h3>
                  <p className="listing-price">₦{listing.price ? parseInt(listing.price).toLocaleString() : 'N/A'}</p>
                  <p className="listing-location">{listing.location || listing.full_address || 'Location not specified'}</p>
                  <div className="listing-details">
                    {listing.number_of_bedrooms && (
                      <span className="detail-item">{listing.number_of_bedrooms} bed</span>
                    )}
                    {listing.number_of_bathrooms && (
                      <span className="detail-item">{listing.number_of_bathrooms} bath</span>
                    )}
                    {listing.size_square_meters && (
                      <span className="detail-item">{listing.size_square_meters} m²</span>
                    )}
                  </div>
                  <p className="listing-date">
                    Listed {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {renderFooter()}
    </main>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="page-shell">Loading...</div>}>
      <ListingsContent />
    </Suspense>
  );
}
