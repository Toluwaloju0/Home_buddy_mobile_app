'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, authFetch } from '../../lib/api';
import UserAvatar from './UserAvatar';

export default function BuyerHeader({ user: providedUser, loadingUser: providedLoadingUser = false, tagline = 'Buyer dashboard' }) {
  const router = useRouter();
  const menuRef = useRef(null);
  const pinnedRef = useRef(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [loadedUser, setLoadedUser] = useState(null);
  const [loadingOwnUser, setLoadingOwnUser] = useState(providedUser === undefined);

  useEffect(() => {
    if (providedUser !== undefined) return undefined;

    let mounted = true;

    async function loadUser() {
      try {
        const response = await authFetch(`${API_BASE_URL}/user/me`, { method: 'GET' });
        const data = await response?.json().catch(() => null);

        if (mounted && response?.status === 200 && data?.payload) {
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
    if (!user) return loadingUser ? 'Loading' : 'Guest';

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    if (fullName) return fullName;
    if (user.email) return user.email.split('@')[0];
    return 'Buyer';
  }, [loadingUser, user]);

  const handleBrandClick = () => {
    if (!user) {
      router.push('/');
      return;
    }

    const role = (user.role || 'buyer').toLowerCase();
    const dashboardRoutes = { seller: '/seller', buyer: '/buyer', both: '/buyer' };
    router.push(dashboardRoutes[role] || '/buyer');
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
        body: JSON.stringify({ role: 'seller' }),
      });

      const data = await response?.json().catch(() => null);
      if (response?.status === 200 && data?.status) {
        router.push('/seller');
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

  const openSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setDropdownOpen(false);
  };

  return (
    <header className="topbar buyer-topbar">
      <button
        type="button"
        className="brand-lockup brand-lockup--clickable"
        onClick={handleBrandClick}
        aria-label="Home Buddy Connect Limited dashboard"
        disabled={loadingUser}
      >
        <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
        <div>
          <div className="brand-name">Home Buddy Connect Limited</div>
          <div className="brand-tagline">{tagline}</div>
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
          <UserAvatar src={user?.image_url || ''} name={displayName} size="sm" className="profile-avatar-shell" />
          <span className="profile-name">{loadingUser ? 'Loading...' : displayName}</span>
          <span className="profile-caret" aria-hidden="true">▾</span>
        </button>

        <div className={`profile-dropdown ${dropdownOpen ? 'profile-dropdown--open' : ''}`} role="menu" aria-hidden={!dropdownOpen}>
          <div className="profile-dropdown-header">
            <UserAvatar src={user?.image_url || ''} name={displayName} size="lg" className="profile-dropdown-avatar-shell" />
            <div>
              <strong>{displayName}</strong>
              <span>{user?.email || 'Verified buyer'}</span>
            </div>
          </div>

          <div className="profile-role-switch" style={{ padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 600, color: 'inherit' }}>Seller mode</div>
              <div
                role="switch"
                aria-checked={false}
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
                  background: '#374151',
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
                    transform: 'translateX(0px)',
                    transition: 'transform 150ms ease',
                  }}
                />
              </div>
            </div>
          </div>

          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/buyer')}>Dashboard</button>
          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/buyer/profile-settings')}>Update Profile</button>
          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => openSection('saved-homes')}>Saved Homes</button>
          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => openSection('requests')}>Inspection Requests</button>
          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => openSection('messages')}>Messages</button>
          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </header>
  );
}
