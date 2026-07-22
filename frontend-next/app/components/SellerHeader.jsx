'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { API_BASE_URL, authFetch } from '../../lib/api';
import UserAvatar from './UserAvatar';

const sellerMenuItems = [
  { label: 'Land', href: '/seller/listings/new/land' },
  { label: 'Shop', href: '/seller/listings/new/shop' },
  { label: 'Apartment', href: '/seller/listings/new/apartment' },
  { label: 'Facility management', href: '/seller/listings' },
  { label: 'Messages', href: '/seller/messages' },
  { label: 'Services', href: '/seller/services' },
];

export default function SellerHeader({ 
  user: providedUser, 
  loadingUser: providedLoadingUser = false, 
  tagline = 'Verified housing platform' 
}) {
  const router = useRouter();
  const pathname = usePathname(); // Detects URL changes
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuToggleRef = useRef(null);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [loadedUser, setLoadedUser] = useState(null);
  const [loadingOwnUser, setLoadingOwnUser] = useState(providedUser === undefined);

  // 1. Close menus when the URL changes (User clicked a link)
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // 2. Global Outside Click Logic
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Check if click is outside Profile Dropdown
      const isInsideProfile = menuRef.current?.contains(event.target);
      
      // Check if click is outside Mobile Menu OR Toggle Button
      const isInsideMobileMenu = mobileMenuRef.current?.contains(event.target);
      const isInsideToggle = mobileMenuToggleRef.current?.contains(event.target);

      if (!isInsideProfile) {
        setDropdownOpen(false);
      }

      if (!isInsideMobileMenu && !isInsideToggle) {
        setMobileMenuOpen(false);
      }
    };

    // Use pointerdown for faster response on mobile
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  // Verification Logic (Keep as is)
  const enforceVerification = async (resolvedUser) => {
    if (!resolvedUser || resolvedUser.is_verified !== false) return;
    try {
      await authFetch(`${API_BASE_URL}/auth/otp/resend`, { method: 'GET' });
      if (typeof window !== 'undefined' && window.location.pathname !== '/verify/otp') {
        router.replace('/verify/otp');
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (providedUser !== undefined) return;
    async function loadUser() {
      const response = await authFetch(`${API_BASE_URL}/user/me`, { method: 'GET' });
      const data = await response?.json().catch(() => null);
      if (response?.status === 200 && data?.payload) {
        await enforceVerification(data.payload);
        setLoadedUser(data.payload);
      }
      setLoadingOwnUser(false);
    }
    loadUser();
  }, [providedUser]);

  const user = providedUser === undefined ? loadedUser : providedUser;
  const loadingUser = providedUser === undefined ? loadingOwnUser : providedLoadingUser;

  const displayName = useMemo(() => {
    if (!user) return loadingUser ? 'Loading' : 'User';
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || user.email?.split('@')[0] || 'User';
  }, [loadingUser, user]);

  const handleLogout = async () => {
    const response = await authFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    if (response?.status === 200) router.push('/login');
  };

  const handleRoleSwitch = async () => {
    if (!user || switchingRole) return;
    setSwitchingRole(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/user/switch-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'buyer' }),
      });
      if (response?.status === 200) router.push('/buyer');
    } finally { setSwitchingRole(false); }
  };

  return (
    <header className="topbar seller-topbar">
      {/* LEFT: LOGO */}
      <button
        className="brand-lockup brand-lockup--clickable"
        onClick={() => router.push('/seller')}
        disabled={loadingUser}
      >
        <img src="/home_buddy_logo.png" alt="Logo" className="brand-logo" />
        <div>
          <div className="brand-name">Home Buddy Connect Limited</div>
          <div className="brand-tagline">{tagline}</div>
        </div>
      </button>

      {/* CENTER: DESKTOP NAV & MOBILE TOGGLE */}
      <nav className="landing-nav-center">
        {sellerMenuItems.map((item) => (
          <Link key={item.href} className="landing-nav-link" href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        ref={mobileMenuToggleRef}
        type="button"
        className="landing-mobile-toggle"
        onClick={() => {
            setDropdownOpen(false); // Close profile if menu opens
            setMobileMenuOpen(!mobileMenuOpen);
        }}
        aria-expanded={mobileMenuOpen}
      >
        <span>☰</span>
      </button>

      {/* RIGHT: PROFILE DROPDOWN */}
      <div className="seller-user-menu" ref={menuRef}>
        <button
          type="button"
          className="profile-trigger"
          onClick={() => {
              setMobileMenuOpen(false); // Close menu if profile opens
              setDropdownOpen(!dropdownOpen);
          }}
        >
          <UserAvatar src={user?.image_url || ''} name={displayName} size="sm" className="profile-avatar-shell" />
          <span className="profile-name">{loadingUser ? '...' : displayName}</span>
          <span className="profile-caret">▾</span>
        </button>

        <div className={`profile-dropdown ${dropdownOpen ? 'profile-dropdown--open' : ''}`}>
          <div className="profile-dropdown-header">
            <UserAvatar src={user?.image_url || ''} name={displayName} size="lg" className="profile-dropdown-avatar-shell" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: '0.9rem' }}>{displayName}</strong>
                <small style={{ fontSize: '0.7rem', color: '#666' }}>Seller Account</small>
            </div>
          </div>
          
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Seller mode</span>
              <div 
                onClick={handleRoleSwitch}
                style={{
                  width: 40, height: 20, borderRadius: 20, background: '#10b981', 
                  position: 'relative', cursor: 'pointer'
                }}
              >
                <div style={{
                  width: 14, height: 14, background: '#fff', borderRadius: '50%',
                  position: 'absolute', right: 3, top: 3
                }} />
              </div>
            </div>
          </div>

          <button className="profile-dropdown-item" onClick={() => router.push('/seller')}>Dashboard</button>
          <button className="profile-dropdown-item" onClick={() => router.push('/seller/profile')}>Settings</button>
          <button className="profile-dropdown-item" style={{ color: '#d32f2f' }} onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className="landing-mobile-menu" style={{ display: 'flex' }}>
          {sellerMenuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="landing-nav-link landing-nav-link--mobile"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
