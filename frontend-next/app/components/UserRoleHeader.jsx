'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/api';
import BuyerHeader from './BuyerHeader';
import LandingHeader from './LandingHeader';
import SellerHeader from './SellerHeader';

export default function UserRoleHeader({ fallbackTagline = 'Verified housing platform' }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!mounted) return;

        if (response.status !== 200) {
          // do not redirect; treat as unauthenticated and render LandingHeader
          setUser(null);
          return;
        }

        const data = await response.json().catch(() => null);
        if (data?.payload) setUser(data.payload);
      } catch (error) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  if (loadingUser) {
    return <LandingHeader />;
  }

  const role = (user?.role || '').toLowerCase();

  if (role === 'seller') {
    return <SellerHeader user={user} loadingUser={false} tagline={fallbackTagline} />;
  }

  // Treat 'both' and 'buyer' as buyer
  if (role === 'buyer' || role === 'both') {
    return <BuyerHeader user={user} loadingUser={false} tagline={fallbackTagline} />;
  }

  return <LandingHeader />;
}
