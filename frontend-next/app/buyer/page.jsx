'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../lib/api';
import BuyerHeader from '../components/BuyerHeader';

const propertyFilters = [
  { key: 'all', label: 'All types' },
  { key: 'shop', label: 'Shop' },
  { key: 'land', label: 'Land' },
  { key: 'flat', label: 'Flat' },
  { key: 'mini flat', label: 'Mini flat' },
  { key: 'bungalow', label: 'Bungalow' },
  { key: 'penthouse', label: 'Penthouse' },
  { key: 'duplex', label: 'Duplex' },
];

const budgetFilters = [
  { key: 'all', label: 'Any budget' },
  { key: '800000-1000000', label: '₦800,000 - ₦1,000,000', min: 800000, max: 1000000 },
  { key: '1000000-5000000', label: '₦1,000,000 - ₦5,000,000', min: 1000000, max: 5000000 },
  { key: '5000000-10000000', label: '₦5,000,000 - ₦10,000,000', min: 5000000, max: 10000000 },
];

const getListingImage = (listing) => {
  const type = String(listing.property_type || '').toLowerCase();
  const mediaKey = type === 'shop' ? 'shop_exterior' : type === 'land' ? 'land_image' : 'exterior';
  const placeholder = type === 'shop' ? '/placeholders/shop.svg' : type === 'land' ? '/placeholders/land.svg' : '/placeholders/apartment.svg';
  const media = (listing.listing_media || []).find((item) => item?.[mediaKey]);
  const value = media?.[mediaKey];

  if (typeof value === 'string' && value) return value;
  if (value?.url) return value.url;
  if (value?.key) return value.key;
  return placeholder;
};


export default function BuyerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [budget, setBudget] = useState('all');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchErrorOpen, setSearchErrorOpen] = useState(false);
  const [loadingBuyerProfile, setLoadingBuyerProfile] = useState(true);
  const [hasBuyerProfile, setHasBuyerProfile] = useState(false);

  const [recommendedHomes, setRecommendedHomes] = useState([]);
  const [savedHomes, setSavedHomes] = useState([]);
  const [inspectionRequests, setInspectionRequests] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [quickStats, setQuickStats] = useState([
    { label: 'Saved homes', value: '0', detail: '' },
    { label: 'Inspections', value: '0', detail: '' },
    { label: 'Messages', value: '0', detail: '' },
    { label: 'Escrow', value: '0', detail: '' },
  ]);

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
        const payload = data.payload;
        const role = (payload.role || '').toLowerCase();

        if (role && role !== 'buyer' && role !== 'both') {
          router.replace('/seller');
          return;
        }

        setUser(payload);
      } else {
        redirectToLogin();
      }

      setLoadingUser(false);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    let mounted = true;

    async function loadBuyerProfile() {
      try {
        const response = await authFetch(`${API_BASE_URL}/buyer/me`, { method: 'GET' });
        if (!mounted) return;
        setHasBuyerProfile(response?.status === 200);
      } catch (error) {
        console.error('Buyer dashboard profile check failed:', error);
        if (mounted) setHasBuyerProfile(false);
      } finally {
        if (mounted) setLoadingBuyerProfile(false);
      }
    }

    loadBuyerProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const displayName = useMemo(() => {
    if (!user) return 'Loading';

    const first = user.first_name || '';
    const last = user.last_name || '';
    const fullName = `${first} ${last}`.trim();

    if (fullName) return fullName;
    if (user.email) return user.email.split('@')[0];
    return 'Buyer';
  }, [user]);

  const visibleHomes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const selectedBudget = budgetFilters.find((item) => item.key === budget);

    return recommendedHomes.filter((home) => {
      const category = home.category || home.property_type || '';
      const price = Number(home.price || home.rent || 0);
      const priceStr = home.price || home.price_display || home.rent || '';
      const matchesType = propertyType === 'all' || category === propertyType;
      const matchesBudget = budget === 'all' || (
        Number.isFinite(price) &&
        selectedBudget?.min &&
        selectedBudget?.max &&
        price >= selectedBudget.min &&
        price <= selectedBudget.max
      );
      const matchesQuery = !query || [home.title || '', home.location || home.full_address || '', priceStr, category]
        .join(' ').toLowerCase().includes(query);

      return matchesType && matchesBudget && matchesQuery;
    });
  }, [recommendedHomes, budget, propertyType, searchQuery]);

  function getSearchMessage(data, hasEmptyPayload) {
    if (hasEmptyPayload) return 'No listing is found for that state or local government area.';
    if (typeof data?.payload === 'string') return data.payload;
    if (typeof data?.message === 'string') return data.message;
    return 'No listings found for this search.';
  }

  async function refreshSearchSession() {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
      method: 'GET',
      credentials: 'include',
    });

    return response.status === 200;
  }

  async function handleSearchSubmit(event) {
    event.preventDefault();

    const location = searchQuery.trim();
    const selectedBudget = budgetFilters.find((item) => item.key === budget);
    const queryParts = ['page=1'];
    const body = {};

    if (location) queryParts.push(`location=${encodeURIComponent(location)}`);
    if (propertyType !== 'all') body.property_type = propertyType;
    if (selectedBudget?.min && selectedBudget?.max) {
      body.min_price = selectedBudget.min;
      body.max_price = selectedBudget.max;
    }

    setSearching(true);
    setSearchError('');
    setSearchErrorOpen(false);

    try {
      const url = `${API_BASE_URL}/properties/browse?${queryParts.join('&')}`;
      const requestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      };

      let response = await fetch(url, requestInit);
      if (response.status === 205) {
        const refreshed = await refreshSearchSession();
        if (refreshed) response = await fetch(url, requestInit);
      }

      const data = await response.json().catch(() => ({}));
      const payload = Array.isArray(data.payload) ? data.payload : data.payload?.listings;

      if (response.status === 200 && Array.isArray(payload) && payload.length > 0) {
        const searchParams = [...queryParts];
        if (propertyType !== 'all') searchParams.push(`property_type=${encodeURIComponent(propertyType)}`);
        if (selectedBudget?.min && selectedBudget?.max) {
          searchParams.push(`min_price=${selectedBudget.min}`);
          searchParams.push(`max_price=${selectedBudget.max}`);
        }

        router.push(`/search?${searchParams.join('&')}`);
        return;
      }

      setSearchError(getSearchMessage(data, response.status === 200 && Array.isArray(payload) && payload.length === 0));
      setSearchErrorOpen(true);
    } catch (err) {
      setSearchError('Unable to search listings. Please try again.');
      setSearchErrorOpen(true);
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadRecommended() {
      try {
        const res = await authFetch(`${API_BASE_URL}/buyer/recommended`, {
          method: 'GET',
        });
        const data = await res.json().catch(() => null);
        if (mounted && res?.status === 200 && data?.status === true && Array.isArray(data.payload)) {
          setRecommendedHomes(data.payload);
        } else if (mounted) {
          setRecommendedHomes([]);
        }
      } catch (err) {
        if (mounted) setRecommendedHomes([]);
      }
    }

    loadRecommended();
    return () => { mounted = false; };
  }, []);

  // Fetch user-specific data after the user is loaded
  useEffect(() => {
    let mounted = true;

    async function loadUserData() {
      if (!user) return;

      try {
        const [savedRes, inspRes, msgRes] = await Promise.all([
          authFetch(`${API_BASE_URL}/buyer/saved`, { method: 'GET' }),
          authFetch(`${API_BASE_URL}/inspections/my-requests`, { method: 'GET' }),
          authFetch(`${API_BASE_URL}/messages/buyer`, { method: 'GET' }),
        ]);

        let savedJson = null;
        let inspJson = null;
        let msgJson = null;

        if (savedRes) {
          savedJson = await savedRes.json().catch(() => null);
          if (mounted && savedRes.status === 200 && savedJson?.payload) setSavedHomes(savedJson.payload);
        }

        if (inspRes) {
          inspJson = await inspRes.json().catch(() => null);
          if (mounted && inspRes.status === 200 && inspJson?.payload) setInspectionRequests(inspJson.payload);
        }

        if (msgRes) {
          msgJson = await msgRes.json().catch(() => null);
          if (mounted && msgRes.status === 200 && msgJson?.payload) {
            const mapped = msgJson.payload.map((c) => {
              const id = (c._id && typeof c._id === 'object') ? JSON.stringify(c._id) : String(c._id || Math.random().toString(36).slice(2));
              const sender = c.sender_name || c.listing_title || 'Conversation';
              const excerpt = c.last_message || '';
              const time = c.last_message_at ? new Date(c.last_message_at).toLocaleString() : '';
              return { id, sender, excerpt, time };
            });
            setRecentMessages(mapped);
          }
        }

        const savedCount = savedJson?.payload?.length ?? 0;
        const inspCount = inspJson?.payload?.length ?? 0;
        const msgCount = msgJson?.payload?.length ?? 0;

        if (mounted) {
          setQuickStats([
            { label: 'Saved homes', value: String(savedCount), detail: '' },
            { label: 'Inspections', value: String(inspCount), detail: '' },
            { label: 'Messages', value: String(msgCount), detail: '' },
            { label: 'Escrow', value: '0', detail: '' },
          ]);
        }
      } catch (err) {
        // console.error('Failed to load user dashboard data', err);
      }
    }

    if (!loadingUser) loadUserData();
    return () => { mounted = false; };
  }, [loadingUser, user]);

  if (loadingUser) {
    return (
      <main className="dashboard-page buyer-dashboard-page buyer-dashboard-page--loading">
        <div className="buyer-loading-card">
          <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="buyer-loading-logo" />
          <h1>Loading your dashboard</h1>
          <p>Checking your session and preparing your buyer workspace.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page buyer-dashboard-page">
      <BuyerHeader user={user} loadingUser={loadingUser} tagline="Buyer dashboard" />

      {!loadingBuyerProfile && !hasBuyerProfile && (
        <div className="seller-profile-dashboard-alert buyer-profile-dashboard-alert" role="status">
          <div>
            <strong>Complete your buyer profile</strong>
            <p>Create a buyer profile and provide your preferences to get the best experience.</p>
          </div>
          <Link className="action-button" href="/buyer/profile?section=buyer">Create buyer profile</Link>
        </div>
      )}

      <div className="dashboard-container buyer-dashboard-container">
        <section className="buyer-hero">
          <div className="buyer-hero-copy">
            <p className="eyebrow">Welcome back, {displayName}</p>
            <h1>Track homes, inspections, and messages from one place.</h1>
            <p>
              Shortlist verified properties, review inspection requests, and stay ahead of new listings without
              bouncing between tabs.
            </p>

            <div className="buyer-hero-actions">
              <button type="button" className="buyer-primary-button" onClick={() => router.push('/buyer/listings')}>
                Browse properties
              </button>
              <button type="button" className="buyer-secondary-button" onClick={() => router.push('/contact')}>
                Contact support
              </button>
            </div>
          </div>

          <div className="buyer-hero-panel">
            <div className="buyer-hero-brand">
              <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="buyer-hero-logo" />
              <div>
                <strong>Home Buddy Connect Limited</strong>
                <span>Verified housing platform</span>
              </div>
            </div>

            <div className="buyer-hero-stats">
              {quickStats.map((stat) => (
                <article className="buyer-stat-card" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <p>{stat.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="buyer-search-panel" aria-label="Search and filters">
          <form className="buyer-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="buyer-search-input"
              placeholder="Search by area, landmark, or property name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <label className="buyer-filter-field">
              <span>Property type</span>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                {propertyFilters.map((filter) => (
                  <option key={filter.key} value={filter.key}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="buyer-filter-field">
              <span>Budget</span>
              <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                {budgetFilters.map((filter) => (
                  <option key={filter.key} value={filter.key}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="buyer-primary-button buyer-primary-button--search" disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>
        </section>

        {searchErrorOpen && (
          <div
            className="search-popout-overlay"
            onClick={(event) => {
              if (event.target === event.currentTarget) setSearchErrorOpen(false);
            }}
          >
            <div className="searchbar-popout-dialog" role="dialog" aria-modal="true">
              <button className="search-popout-close" onClick={() => setSearchErrorOpen(false)} aria-label="Close">
                ×
              </button>
              <div className="search-popout-form">
                <p className="searchbar-popout-message rent-popout-message" role="alert">
                  {searchError}
                </p>
              </div>
            </div>
          </div>
        )}

        <section className="buyer-section" id="recommendations">
          <div className="section-header">
            <div>
              <p className="section-kicker">Recommended</p>
              <h2>Homes that fit your search</h2>
            </div>
            <span className="section-count">{visibleHomes.length} matches</span>
          </div>

          <div className="property-grid">
            {visibleHomes.map((home) => {
              const key = home._id || home.id;
              const img = getListingImage(home);
              const category = home.category || home.property_type || '';
              const price = home.price || home.price_display || home.rent || '';

              return (
                <article
                  className="buyer-property-card"
                  key={key}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/buyer/listings/${key}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') router.push(`/buyer/listings/${key}`);
                  }}
                >
                  <img src={img} alt={home.title || 'Property'} className="buyer-property-image" />
                  <div className="buyer-property-body">
                    <div className="buyer-property-topline">
                      <span>{category === 'shortlet' ? 'Short let' : category === 'rent' ? 'For rent' : 'For sale'}</span>
                      <strong>{home.match || ''}</strong>
                    </div>
                    <h3>{home.title}</h3>
                    <p>{home.location || home.full_address}</p>
                    <div className="buyer-property-footer">
                      <strong>{price}</strong>
                      <button type="button" className="buyer-text-button">View details</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="buyer-dashboard-grid">
          <section className="buyer-section" id="saved-homes">
            <div className="section-header">
              <div>
                <p className="section-kicker">Shortlist</p>
                <h2>Saved homes</h2>
              </div>
              <span className="section-count">{savedHomes.length}</span>
            </div>

            <div className="compact-list">
              {savedHomes.map((home) => (
                <article className="compact-list-item" key={home._id || home.id}>
                  <div>
                    <h3>{home.title}</h3>
                    <p>{home.location || home.full_address}</p>
                    <span>{home.note || ''}</span>
                  </div>
                  <strong>{home.price || home.rent || ''}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="buyer-section" id="requests">
            <div className="section-header">
              <div>
                <p className="section-kicker">Viewings</p>
                <h2>Inspection requests</h2>
              </div>
            </div>

            <div className="compact-list">
              {inspectionRequests.map((request) => (
                <article className="compact-list-item compact-list-item--stacked" key={request._id || request.id}>
                  <div>
                    <h3>{request.property || request.property_id}</h3>
                    <p>{request.preferred_time || request.time || ''}</p>
                  </div>
                  <span className={`status-pill status-pill--${(request.status || '').toLowerCase()}`}>{request.status || ''}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="buyer-section" id="messages">
            <div className="section-header">
              <div>
                <p className="section-kicker">Inbox</p>
                <h2>Recent messages</h2>
              </div>
            </div>

            <div className="message-list">
              {recentMessages.map((message) => (
                <article className="message-item" key={message.id}>
                  <div>
                    <h3>{message.sender}</h3>
                    <p>{message.excerpt}</p>
                  </div>
                  <span>{message.time}</span>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="buyer-section buyer-cta-section">
          <div>
            <p className="section-kicker">Next step</p>
            <h2>Keep your home search moving</h2>
            <p>Browse more verified listings or reach support if a property needs review.</p>
          </div>
          <div className="buyer-cta-actions">
            <button type="button" className="buyer-primary-button" onClick={() => router.push('/buyer/listings')}>
              Explore more homes
            </button>
            <Link href="/support" className="buyer-secondary-button">
              Get help
            </Link>
          </div>
        </section>

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
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/about-us">About Us</Link></li>
                <li><Link href="/services">Our Services</Link></li>
                <li><Link href="/login">Login</Link></li>
                <li><Link href="/signup">Register</Link></li>
                <li><Link href="/support">Support</Link></li>
              </ul>
              <ul className="footer-column">
                <li><Link href="/terms">Terms</Link></li>
                <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/sitemap">Sitemap</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </nav>
          </div>

          <div className="footer-bottom">
            <div className="footer-copy">© 2026 Home Buddy Connect Limited. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </main>
  );
}
