"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../lib/api';
import BuyerHeader from '../../components/BuyerHeader';

function getCookieValue(name) {
  if (typeof document === 'undefined') return '';

  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : '';
}

function resolveImage(listing) {
  if (!listing) return '/home_buddy_logo.png';
  if (listing.image) return listing.image;
  if (Array.isArray(listing.images) && listing.images.length > 0) {
    const first = listing.images[0];
    return typeof first === 'string' ? first : first.url || first.path || '/home_buddy_logo.png';
  }
  if (listing.media && Array.isArray(listing.media.images) && listing.media.images.length > 0) {
    const first = listing.media.images[0];
    return typeof first === 'string' ? first : first.url || first.path || '/home_buddy_logo.png';
  }
  return '/home_buddy_logo.png';
}

export default function ListingsPage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function refreshListingSession() {
    const res = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
      method: 'GET',
      credentials: 'include',
    });

    return res.ok;
  }

  async function fetchRecommendedListings() {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });

    return fetch(`${API_BASE_URL}/properties/recommended?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        let res = await fetchRecommendedListings();

        if (res.status === 205) {
          const refreshed = await refreshListingSession();
          if (!refreshed) {
            redirectToLogin();
            return;
          }

          res = await fetchRecommendedListings();
        }

        const data = await res.json().catch(() => null);
        if (!mounted) return;
        if (res.ok && data?.payload) {
          const payload = data.payload || {};
          setListings(payload.listings || []);
          setTotal((payload.meta && payload.meta.total) || 0);
        }
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [page]);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const res = await authFetch(`${API_BASE_URL}/user/me`, { method: 'GET' });
        if (!res) {
          if (mounted) setLoadingUser(false);
          return;
        }

        const data = await res.json().catch(() => null);
        if (!mounted) return;
        if (res.status === 200 && data?.payload) {
          setUser(data.payload);
        }
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }

    loadUser();
    return () => { mounted = false; };
  }, []);

  const pages = Math.max(1, Math.ceil((total || 0) / perPage));

  return (
    <main className="listings-page">
      <BuyerHeader user={user} loadingUser={loadingUser} tagline="Listings" />

      <header className="listings-header">
        <h1>All listings</h1>
        <p>{total} listings</p>
      </header>

      <section className="property-grid" aria-live="polite">
        {loading && <div className="listings-loading">Loading listings...</div>}
        {!loading && listings.length === 0 && <div className="no-listings">No listings found.</div>}

        {!loading && listings.map((listing) => {
          const id = listing._id || listing.id;
          const img = resolveImage(listing);
          const title = listing.title || listing.submission_id || 'Property';
          const location = listing.location || listing.full_address || '';
          const price = listing.price || listing.price_display || listing.rent || '';
          const categoryLabel = listing.category === 'shortlet' ? 'Short let' : listing.category === 'rent' ? 'For rent' : 'For sale';

          return (
            <article className="buyer-property-card" key={id}>
              <Link href={`/buyer/listings/${id}`} className="buyer-property-link" aria-label={`Open details for ${title}`}>
                <div className="image-shell">
                  <img src={img} alt={title} className="buyer-property-image" />
                  <div className="image-overlay">
                    <span className="type-badge">{categoryLabel}</span>
                    <span className="price-badge">{price}</span>
                  </div>
                </div>

                <div className="buyer-property-body">
                  <h3 className="property-title">{title}</h3>
                  <p className="property-location">{location}</p>

                  <div className="buyer-property-footer">
                    <span className="meta">Verified listing</span>
                    <span className="view-details">View details →</span>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </section>

      <footer className="listings-pagination">
        <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>Next</button>
      </footer>

      <footer className="buyer-footer">
        <div className="footer-brand">
          <div className="brand-lockup brand-lockup--footer" aria-label="Home Buddy Connect Limited">
            <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
            <div>
              <div className="brand-name">Home Buddy Connect Limited</div>
              <div className="brand-tagline">Verified housing platform</div>
            </div>
          </div>
          <p>
            Secure property discovery, clearer communication, and a better buying experience for every verified
            user.
          </p>
        </div>

        <nav className="buyer-footer-links" aria-label="Footer navigation">
          <Link href="/contact">Contact</Link>
          <Link href="/services">Services</Link>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
      </footer>
    </main>
  );
}
