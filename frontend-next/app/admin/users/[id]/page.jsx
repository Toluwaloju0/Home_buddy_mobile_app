'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '../../../../lib/api';

function formatDateTime(value) {
  if (!value) {
    return 'Not recorded';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not recorded';
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function displayValue(value) {
  if (value === true) {
    return 'Yes';
  }

  if (value === false) {
    return 'No';
  }

  return value || 'Not recorded';
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      if (!userId) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response) {
          router.replace('/admin/login');
          return;
        }

        const data = await response.json().catch(() => null);

        if (response.status === 401 || response.status === 205) {
          router.replace('/admin/login');
          return;
        }

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load user');
        }

        if (isMounted) {
          setUser(data?.payload || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load user');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router, userId]);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  const title = fullName || user?.email || 'User account';

  return (
    <main className="dashboard-page admin-dashboard-page">
      <header className="topbar admin-topbar">
        <Link className="brand-lockup brand-lockup--clickable" href="/admin/users" aria-label="Back to users">
          <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
          <div>
            <div className="brand-name">Home Buddy Connect Limited</div>
            <div className="brand-tagline">User details</div>
          </div>
        </Link>

        <Link href="/admin/users" className="admin-page-button admin-back-button">
          Users
        </Link>
      </header>

      <div className="dashboard-container admin-dashboard-container">
        <section className="admin-list-header">
          <div>
            <p className="eyebrow">Account profile</p>
            <h1>{loading ? 'Loading user' : title}</h1>
          </div>
          {user ? (
            <div className={user.is_verified ? 'admin-pill admin-pill--ok' : 'admin-pill admin-pill--muted'}>
              {user.is_verified ? 'Email verified' : 'Email unverified'}
            </div>
          ) : null}
        </section>

        {error ? <div className="admin-error-banner">{error}</div> : null}

        {loading ? (
          <div className="admin-loading-card">
            <p className="eyebrow">User details</p>
            <h1>Loading profile</h1>
            <p>Checking admin access and retrieving this account.</p>
          </div>
        ) : user ? (
          <section className="admin-detail-grid" aria-label="User information">
            <div className="admin-profile-card">
              <div className="admin-user-avatar">
                {user.image_url ? (
                  <img src={user.image_url} alt={title} />
                ) : (
                  <span>{(title || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h2>{title}</h2>
              <p>{user.email || 'No email recorded'}</p>
            </div>

            <div className="admin-detail-panel">
              <dl className="admin-detail-list">
                <div>
                  <dt>User ID</dt>
                  <dd>{user._id}</dd>
                </div>
                <div>
                  <dt>First name</dt>
                  <dd>{displayValue(user.first_name)}</dd>
                </div>
                <div>
                  <dt>Last name</dt>
                  <dd>{displayValue(user.last_name)}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{displayValue(user.role)}</dd>
                </div>
                <div>
                  <dt>Phone number</dt>
                  <dd>{displayValue(user.phone_number)}</dd>
                </div>
                <div>
                  <dt>Phone verified</dt>
                  <dd>{displayValue(user.phone_number_verified)}</dd>
                </div>
                <div>
                  <dt>Email verified</dt>
                  <dd>{displayValue(user.is_verified)}</dd>
                </div>
                <div>
                  <dt>Created at</dt>
                  <dd>{formatDateTime(user.created_at)}</dd>
                </div>
              </dl>
            </div>
          </section>
        ) : (
          <div className="admin-empty-state">User not found.</div>
        )}
      </div>
    </main>
  );
}
