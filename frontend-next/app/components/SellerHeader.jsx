'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, authFetch } from '../../lib/api';
import UserAvatar from './UserAvatar';

export default function SellerHeader({ user: providedUser, loadingUser: providedLoadingUser = false, tagline = 'Verified housing platform' }) {
  const router = useRouter();
  const menuRef = useRef(null);
  const pinnedRef = useRef(false);
  const verificationRedirectInFlightRef = useRef(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [loadedUser, setLoadedUser] = useState(null);
  const [loadingOwnUser, setLoadingOwnUser] = useState(providedUser === undefined);

  const enforceVerification = async (resolvedUser) => {
    if (!resolvedUser || resolvedUser.is_verified !== false || verificationRedirectInFlightRef.current) {
      return;
    }

    verificationRedirectInFlightRef.current = true;

    try {
      await authFetch(`${API_BASE_URL}/auth/otp/resend`, { method: 'GET' });
    } catch (error) {
      console.error('OTP resend failed before verification redirect:', error);
    } finally {
      if (typeof window !== 'undefined' && window.location.pathname !== '/verify/otp') {
        router.replace('/verify/otp');
      }
    }
  };

  useEffect(() => {
    if (providedUser !== undefined) return undefined;

    let mounted = true;

    async function loadUser() {
      try {
        const response = await authFetch(`${API_BASE_URL}/user/me`, { method: 'GET' });
        const data = await response?.json().catch(() => null);

        if (mounted && response?.status === 200 && data?.payload) {
          await enforceVerification(data.payload);
          setLoadedUser(data.payload);
        }
      } finally {
        if (mounted) {
          setLoadingOwnUser(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [providedUser]);

  const user = providedUser === undefined ? loadedUser : providedUser;
  const loadingUser = providedUser === undefined ? loadingOwnUser : providedLoadingUser;

  useEffect(() => {
    if (!user) return;

    enforceVerification(user);
  }, [user]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const handlePointerOver = (event) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target)) {
        setDropdownOpen(true);
      } else if (!pinnedRef.current) {
        setDropdownOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) return;
      setDropdownOpen(false);
      pinnedRef.current = false;
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
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
    if (!user) return loadingUser ? 'Loading' : 'User';

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    if (fullName) return fullName;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  }, [loadingUser, user]);

  const handleBrandClick = () => {
    if (!user) return;

    const role = (user.role || 'seller').toLowerCase();
    const dashboardRoutes = { seller: '/seller', buyer: '/buyer', agent: '/agent', both: '/seller' };
    router.push(dashboardRoutes[role] || '/seller');
  };

  const handleLogout = async () => {
    setDropdownOpen(false);

    try {
      const response = await authFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
      const data = await response?.json().catch(() => null);

      if (response?.status === 200) {
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
    if (!user || switchingRole) return;

    setSwitchingRole(true);
    setDropdownOpen(false);

    try {
      const response = await authFetch(`${API_BASE_URL}/user/switch-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'buyer' }),
      });

      const data = await response?.json().catch(() => null);
      if (response?.status === 200 && data?.status) {
        router.push('/buyer');
      } else {
        alert(data?.message || 'Role switch failed.');
      }
    } catch (error) {
      console.error('Role switch error:', error);
      alert('Role switch failed. Please try again.');
    } finally {
      setSwitchingRole(false);
    }
  };

  return (
    <header className="topbar seller-topbar">
      <button
        type="button"
        className="brand-lockup brand-lockup--clickable"
        onClick={handleBrandClick}
        aria-label="Home Buddy Connect Limited dashboard"
        disabled={!user || loadingUser}
      >
        <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
        <div>
          <div className="brand-name">Home Buddy Connect Limited</div>
          <div className="brand-tagline">{tagline}</div>
        </div>
      </button>

      <div className="topbar-tags" aria-hidden="true">
        <span>Sell</span>
        <span>Agents</span>
        <span>Facility Mgt</span>
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
          <UserAvatar src={user?.image_url || ''} name={displayName} size="sm" className="profile-avatar-shell" />
          <span className="profile-name">{loadingUser ? 'Loading...' : displayName}</span>
          <span className="profile-caret" aria-hidden="true">▾</span>
        </button>

        <div className={`profile-dropdown ${dropdownOpen ? 'profile-dropdown--open' : ''}`} role="menu" aria-hidden={!dropdownOpen}>
          <div className="profile-dropdown-header">
            <UserAvatar src={user?.image_url || ''} name={displayName} size="lg" className="profile-dropdown-avatar-shell" />
            <strong>{displayName}</strong>
          </div>

          <div className="profile-role-switch" style={{ padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 600, color: 'inherit' }}>Seller mode</div>
              <div
                role="switch"
                aria-checked
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleRoleSwitch();
                  }
                }}
                onClick={handleRoleSwitch}
                style={{
                  width: 48,
                  height: 28,
                  borderRadius: 9999,
                  background: '#10b981',
                  padding: 4,
                  cursor: switchingRole ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 9999,
                    background: '#fff',
                    transform: 'translateX(20px)',
                    transition: 'transform 150ms ease',
                  }}
                />
              </div>
            </div>
          </div>

          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller')}>Dashboard</button>
          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/listings')}>My Listings</button>
          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/messages')}>Messages</button>
          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/profile')}>Profile Settings</button>
          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/listings/new')}>Add Listing</button>
          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </header>
  );
}
