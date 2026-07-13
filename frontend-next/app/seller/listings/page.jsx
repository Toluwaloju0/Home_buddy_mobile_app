'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../lib/api';
import SellerHeader from '../../components/SellerHeader';

function ListingsContent() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

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
      setLoadingListings(true);
      const response = await authFetch(`${API_BASE_URL}/seller/listings/all?page=${page}`, {
        method: 'GET',
      });

      if (!response) {
        if (mounted) setLoadingListings(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (!mounted) return;

      if (response.status === 200 && data?.payload) {
        const nextListings = Array.isArray(data.payload) ? data.payload : [];
        setListings(nextListings);
        setHasNextPage(nextListings.length > 0);
      } else {
        console.error('Failed to load listings:', data?.message);
        setListings([]);
        setHasNextPage(false);
      }

      setLoadingListings(false);
    }

    loadListings();

    return () => {
      mounted = false;
    };
  }, [page]);

  const renderFooter = () => (
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
  );

  const getThumbnailImage = (listing) => {
    return listing.preview_url || getPropertyPlaceholder(listing.property_type);
  };

  const getPropertyPlaceholder = (propertyType) => {
    const normalizedType = String(propertyType || '').toLowerCase().trim();

    if (normalizedType === 'shop') {
      return '/placeholders/shop.svg';
    }

    if (normalizedType === 'land') {
      return '/placeholders/land.svg';
    }

    return '/placeholders/apartment.svg';
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
    if (!status) return '';
    return String(status).replace(/_/g, ' ');
  };

  return (
    <main className="page-shell seller-page-shell">
      <SellerHeader user={user} loadingUser={loadingUser} />

      <section className="listings-container">
        <div className="listings-header">
          <h1>My Listings</h1>
          {/* <Link href="/seller/listings/new" className="btn-primary"> */}
            {/* + Add New Listing
          </Link> */}
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
                    alt={listing.property_type || 'Property listing'}
                    onError={(e) => {
                      e.currentTarget.src = getPropertyPlaceholder(listing.property_type);
                    }}
                  />
                  {listing.status ? (
                    <span className={`listing-status ${getStatusColor(listing.status)}`}>
                      {getStatusLabel(listing.status)}
                    </span>
                  ) : null}
                </div>
                <div className="listing-card-content">
                  <h3>{listing.description || 'No description provided'}</h3>
                  <p className="listing-price">₦{listing.price ? parseInt(listing.price).toLocaleString() : 'N/A'}</p>
                  <p className="listing-location">{listing.property_type || 'Property type not specified'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loadingListings && listings.length > 0 ? (
          <div className="listings-pagination">
            <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page === 1}>
              Previous
            </button>
            <span>Page {page}</span>
            <button type="button" onClick={() => setPage((current) => current + 1)} disabled={!hasNextPage}>
              Next
            </button>
          </div>
        ) : null}
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
