'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

export default function AdminHeader({
  tagline = 'Admin dashboard',
  backHref = '/admin',
  backLabel = 'Dashboard',
  showQuickLinks = false,
  showLogout = false,
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Admin logout failed:', error);
    } finally {
      router.push('/');
    }
  };

  return (
    <header className="topbar admin-topbar">
      <Link className="brand-lockup brand-lockup--clickable" href={backHref} aria-label="Home Buddy Connect Limited admin">
        <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
        <div>
          <div className="brand-name">Home Buddy Connect Limited</div>
          <div className="brand-tagline">{tagline}</div>
        </div>
      </Link>

      {showQuickLinks ? (
        <div className="topbar-tags admin-topbar-tags" aria-label="Admin quick links">
          <span>Moderation</span>
          <span>Verification</span>
          <span>Support</span>
        </div>
      ) : null}

      {showLogout ? (
        <button type="button" onClick={handleLogout} className="primary-button admin-logout-button">
          Logout
        </button>
      ) : (
        <Link href={backHref} className="admin-page-button admin-back-button">
          {backLabel}
        </Link>
      )}
    </header>
  );
}
