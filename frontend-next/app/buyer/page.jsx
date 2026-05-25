'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../lib/api';
import UserAvatar from '../components/UserAvatar';

const quickStats = [
  { label: 'Saved homes', value: '12', detail: '3 new matches today' },
  { label: 'Inspections', value: '4', detail: '2 confirmed this week' },
  { label: 'Messages', value: '9', detail: '1 urgent reply pending' },
  { label: 'Escrow', value: '2', detail: 'Funds waiting to clear' },
];

const propertyFilters = [
  { key: 'all', label: 'All types' },
  { key: 'buy', label: 'Buy' },
  { key: 'rent', label: 'Rent' },
  { key: 'shortlet', label: 'Short let' },
];

const featuredHomes = [
  {
    id: 1,
    title: 'Lekki Lagoon Residence',
    location: 'Lekki Phase 1, Lagos',
    price: '₦1,000,000',
    category: 'buy',
    match: '97% match',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    title: 'Island View Apartment',
    location: 'Victoria Island, Lagos',
    price: '₦900,000',
    category: 'rent',
    match: '94% match',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    title: 'Mansion Creek Duplex',
    location: 'Ikoyi, Lagos',
    price: '₦2,300,000',
    category: 'shortlet',
    match: '92% match',
    image:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
  },
];

const savedHomes = [
  {
    id: 'saved-1',
    title: 'Eko Garden Loft',
    location: 'Epe, Lagos',
    price: '₦1,000,000',
    note: 'Landlord replied 10 minutes ago',
  },
  {
    id: 'saved-2',
    title: 'Mainland Comfort Flat',
    location: 'Yaba, Lagos',
    price: '₦1,100,000',
    note: 'Open inspection tomorrow at 11:00',
  },
  {
    id: 'saved-3',
    title: 'Island Studio Suite',
    location: 'Oniru, Lagos',
    price: '₦850,000',
    note: 'Newly added to your shortlist',
  },
];

const inspectionRequests = [
  {
    id: 'inspect-1',
    property: 'Island View Apartment',
    status: 'Confirmed',
    time: 'Thursday, 10:00 AM',
  },
  {
    id: 'inspect-2',
    property: 'Lekki Lagoon Residence',
    status: 'Pending',
    time: 'Friday, 1:30 PM',
  },
];

const recentMessages = [
  {
    id: 'msg-1',
    sender: 'Prime Edge Properties',
    excerpt: 'Your viewing request for the Lekki unit has been approved.',
    time: '12m ago',
  },
  {
    id: 'msg-2',
    sender: 'Home Buddy Connect Limited Support',
    excerpt: 'We confirmed your profile and escrow preferences.',
    time: 'Yesterday',
  },
];

export default function BuyerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const menuRef = useRef(null);
  const pinnedRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [budget, setBudget] = useState('all');

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
    if (typeof document === 'undefined') return;

    const handlePointerOver = (e) => {
      if (!menuRef.current) return;
      const inside = menuRef.current.contains(e.target);
      if (inside) {
        setDropdownOpen(true);
      } else if (!pinnedRef.current) {
        setDropdownOpen(false);
      }
    };

    const handlePointerDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
        pinnedRef.current = false;
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        pinnedRef.current = false;
      }
    };

    document.addEventListener('pointerover', handlePointerOver);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
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

  const userImageUrl = user?.image_url || '';

  const visibleHomes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return featuredHomes.filter((home) => {
      const matchesType = propertyType === 'all' || home.category === propertyType;
      const matchesBudget = budget === 'all' || home.price.includes(budget);
      const matchesQuery = !query
        || [home.title, home.location, home.price, home.category].join(' ').toLowerCase().includes(query);

      return matchesType && matchesBudget && matchesQuery;
    });
  }, [budget, propertyType, searchQuery]);

  const handleBrandClick = () => {
    if (!user) return;

    const role = (user.role || 'buyer').toLowerCase();
    const dashboardRoutes = {
      seller: '/seller',
      buyer: '/buyer',
      both: '/buyer',
    };

    router.push(dashboardRoutes[role] || '/buyer');
  };

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

  const handleRoleSwitch = async () => {
    if (!user) return;

    // Determine the target role based on current path; if on buyer pages, switch to seller.
    const isOnBuyerPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/buyer');
    const targetRole = isOnBuyerPage ? 'seller' : 'buyer';

    setSwitchingRole(true);
    setDropdownOpen(false);

    try {
      const response = await authFetch(`${API_BASE_URL}/user/switch-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });

      setSwitchingRole(false);

      if (!response) {
        alert('Role switch failed. Please sign in again.');
        return;
      }

      const data = await response.json().catch(() => null);
      if (response.status === 200 && data?.status) {
        // navigate to corresponding dashboard
        router.push(targetRole === 'seller' ? '/seller' : '/buyer');
      } else {
        alert(data?.message || 'Role switch failed.');
      }
    } catch (err) {
      setSwitchingRole(false);
      console.error('Role switch error', err);
      alert('Role switch failed. Please try again.');
    }
  };

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
      <header className="topbar buyer-topbar">
        <button
          type="button"
          className="brand-lockup brand-lockup--clickable"
          onClick={handleBrandClick}
          aria-label="Home Buddy Connect Limited dashboard"
          disabled={!user}
        >
          <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
          <div>
            <div className="brand-name">Home Buddy Connect Limited</div>
            <div className="brand-tagline">Buyer dashboard</div>
          </div>
        </button>

        <div className="topbar-tags buyer-topbar-tags" aria-label="Buyer quick links">
          <a href="#recommendations">Recommendations</a>
          <a href="#saved-homes">Saved Homes</a>
          <a href="#requests">Inspections</a>
          <a href="#messages">Messages</a>
        </div>

        <div className="seller-user-menu" ref={menuRef}>
          <button
            type="button"
            className="profile-trigger"
            onClick={() => {
              const next = !dropdownOpen;
              setDropdownOpen(next);
              pinnedRef.current = next;
            }}
            onFocus={() => setDropdownOpen(true)}
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
          >
            <UserAvatar src={userImageUrl} name={displayName} size="sm" className="profile-avatar-shell" />
            <span className="profile-name">{displayName}</span>
            <span className="profile-caret" aria-hidden="true">▾</span>
          </button>

          <div
            className={`profile-dropdown ${dropdownOpen ? 'profile-dropdown--open' : ''}`}
            role="menu"
            aria-hidden={!dropdownOpen}
          >
            <div className="profile-dropdown-header">
              <UserAvatar src={userImageUrl} name={displayName} size="lg" className="profile-dropdown-avatar-shell" />
              <div>
                <strong>{displayName}</strong>
                <span>{user?.email || 'Verified buyer'}</span>
              </div>
            </div>
            <div className="profile-role-switch" style={{ padding: '8px 12px' }}>
              {(() => {
                const isSellerView = typeof window !== 'undefined' && window.location.pathname.startsWith('/seller');
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600, color: 'inherit' }}>Seller mode</div>
                    <div
                      role="switch"
                      aria-checked={isSellerView}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!switchingRole) handleRoleSwitch(); } }}
                      onClick={() => { if (!switchingRole) handleRoleSwitch(); }}
                      style={{
                        width: 48,
                        height: 28,
                        borderRadius: 9999,
                        background: isSellerView ? '#10b981' : '#374151',
                        padding: 4,
                        cursor: switchingRole ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: 9999,
                        background: '#fff',
                        transform: isSellerView ? 'translateX(20px)' : 'translateX(0px)',
                        transition: 'transform 150ms ease',
                      }} />
                    </div>
                  </div>
                );
              })()}
            </div>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/buyer')}>Dashboard</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/buyer/profile-settings')}>Update Profile</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => document.getElementById('saved-homes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Saved Homes</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => document.getElementById('requests')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Inspection Requests</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => document.getElementById('messages')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Messages</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={handleLogout}>Log out</button>
          </div>
        </div>
      </header>

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
              <button type="button" className="buyer-primary-button" onClick={() => router.push('/')}>
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
          <form className="buyer-search-form" onSubmit={(e) => e.preventDefault()}>
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
                <option value="all">Any budget</option>
                <option value="800,000">Up to ₦800,000</option>
                <option value="1,000,000">Up to ₦1,000,000</option>
                <option value="2,000,000">Up to ₦2,000,000</option>
              </select>
            </label>

            <button type="submit" className="buyer-primary-button buyer-primary-button--search">
              Search
            </button>
          </form>
        </section>

        <section className="buyer-section" id="recommendations">
          <div className="section-header">
            <div>
              <p className="section-kicker">Recommended</p>
              <h2>Homes that fit your search</h2>
            </div>
            <span className="section-count">{visibleHomes.length} matches</span>
          </div>

          <div className="property-grid">
            {visibleHomes.map((home) => (
              <article className="buyer-property-card" key={home.id}>
                <img src={home.image} alt={home.title} className="buyer-property-image" />
                <div className="buyer-property-body">
                  <div className="buyer-property-topline">
                    <span>{home.category === 'shortlet' ? 'Short let' : home.category === 'rent' ? 'For rent' : 'For sale'}</span>
                    <strong>{home.match}</strong>
                  </div>
                  <h3>{home.title}</h3>
                  <p>{home.location}</p>
                  <div className="buyer-property-footer">
                    <strong>{home.price}</strong>
                    <button type="button" className="buyer-text-button">View details</button>
                  </div>
                </div>
              </article>
            ))}
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
                <article className="compact-list-item" key={home.id}>
                  <div>
                    <h3>{home.title}</h3>
                    <p>{home.location}</p>
                    <span>{home.note}</span>
                  </div>
                  <strong>{home.price}</strong>
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
                <article className="compact-list-item compact-list-item--stacked" key={request.id}>
                  <div>
                    <h3>{request.property}</h3>
                    <p>{request.time}</p>
                  </div>
                  <span className={`status-pill status-pill--${request.status.toLowerCase()}`}>{request.status}</span>
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
            <button type="button" className="buyer-primary-button" onClick={() => router.push('/')}>
              Explore more homes
            </button>
            <Link href="/support" className="buyer-secondary-button">
              Get help
            </Link>
          </div>
        </section>

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
      </div>
    </main>
  );
}
