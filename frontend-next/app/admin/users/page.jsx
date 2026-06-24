'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '../../../lib/api';
import AdminHeader from '../../components/AdminHeader';

function formatDate(value) {
  if (!value) {
    return 'Not recorded';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not recorded';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function userName(user) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return name || user.email || 'Unnamed user';
}

function AdminUsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(Number(searchParams.get('page') || 1), 1);
  const perPage = 20;

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: perPage, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/admin/users?page=${page}&per_page=${perPage}`, {
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
          throw new Error(data?.message || 'Failed to load users');
        }

        if (!isMounted) {
          return;
        }

        setUsers(data?.payload?.users || []);
        setMeta(data?.payload?.meta || { page, per_page: perPage, total: 0, total_pages: 0 });
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load users');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [page, router]);

  const pageSummary = useMemo(() => {
    if (!meta.total) {
      return '0 users';
    }

    const start = (meta.page - 1) * meta.per_page + 1;
    const end = Math.min(meta.page * meta.per_page, meta.total);
    return `${start}-${end} of ${meta.total.toLocaleString()} users`;
  }, [meta]);

  return (
    <main className="dashboard-page admin-dashboard-page">
      <AdminHeader tagline="Admin users" backHref="/admin" backLabel="Dashboard" />

      <div className="dashboard-container admin-dashboard-container">
        <section className="admin-list-header">
          <div>
            <p className="eyebrow">Users</p>
            <h1>Registered accounts</h1>
          </div>
          <div className="admin-list-summary">{loading ? 'Loading users' : pageSummary}</div>
        </section>

        {error ? <div className="admin-error-banner">{error}</div> : null}

        <section className="admin-table-shell" aria-label="All users">
          <div className="admin-users-table">
            <div className="admin-users-row admin-users-row--head">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Joined</span>
            </div>

            {loading ? (
              <div className="admin-empty-state">Loading registered users...</div>
            ) : users.length ? (
              users.map((user) => (
                <Link key={user._id} href={`/admin/users/${user._id}`} className="admin-users-row">
                  <span className="admin-user-name">{userName(user)}</span>
                  <span>{user.email || 'No email'}</span>
                  <span className="admin-pill">{user.role || 'buyer'}</span>
                  <span className={user.is_verified ? 'admin-pill admin-pill--ok' : 'admin-pill admin-pill--muted'}>
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                  <span>{formatDate(user.created_at)}</span>
                </Link>
              ))
            ) : (
              <div className="admin-empty-state">No users found.</div>
            )}
          </div>
        </section>

        <div className="admin-pagination">
          <Link
            href={`/admin/users?page=${Math.max(page - 1, 1)}`}
            className={`admin-page-button ${page <= 1 ? 'admin-pagination__disabled' : ''}`}
            aria-disabled={page <= 1}
          >
            Previous
          </Link>
          <span>
            Page {meta.page || page} of {Math.max(meta.total_pages || 1, 1)}
          </span>
          <Link
            href={`/admin/users?page=${page + 1}`}
            className={`admin-page-button ${meta.total_pages && page >= meta.total_pages ? 'admin-pagination__disabled' : ''}`}
            aria-disabled={Boolean(meta.total_pages && page >= meta.total_pages)}
          >
            Next
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <main className="dashboard-page admin-dashboard-page">
          <div className="admin-loading-card">
            <p className="eyebrow">Users</p>
            <h1>Loading users</h1>
            <p>Preparing the admin user list.</p>
          </div>
        </main>
      }
    >
      <AdminUsersContent />
    </Suspense>
  );
}
