'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/dashboard/stats`,
          {
            credentials: 'include',
          }
        );

        const data = await response.json().catch(() => null);

        if (response.status === 401) {
          router.replace('/login');
          return;
        }

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load admin dashboard');
        }

        if (!isMounted) {
          return;
        }

        setStats(data?.payload || {});
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err.message || 'Failed to load admin dashboard');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      // ignore errors
    } finally {
      router.push('/');
    }
  };

  const dashboardItems = [
    {
      label: 'Total users',
      value: stats.total_users ?? 0,
      description: 'All registered accounts in the system.',
      href: '/admin/users',
    },
    // {
    //   label: 'Email verified users',
    //   value: stats.email_verified_users ?? 0,
    //   description: 'Accounts that completed email verification.',
    //   href: '/admin/users/verified',
    // },
    {
      label: 'Email non verified users',
      value: stats.email_non_verified_users ?? 0,
      description: 'Accounts still pending verification.',
      href: '/admin/users/unverified',
    },
    {
      label: 'Total properties',
      value: stats.total_properties ?? 0,
      description: 'All property listings in the database.',
      href: '/admin/properties',
    },
    {
      label: 'Available properties',
      value: stats.available_properties ?? 0,
      description: 'Listings not yet marked as sold.',
      href: '/admin/properties/available',
    },
    {
      label: 'Occupied properties',
      value: stats.occupied_properties ?? 0,
      description: 'Listings already sold or completed.',
      href: '/admin/properties/occupied',
    },
    {
      label: 'Approved property listings',
      value: stats.approved_property_listings ?? 0,
      description: 'Listings cleared for marketplace visibility.',
      href: '/admin/properties/approved',
    },
    {
      label: 'Pending property listings',
      value: stats.pending_property_listings ?? 0,
      description: 'Listings awaiting review or approval.',
      href: '/admin/properties/pending',
    },
    {
      label: 'Support tickets',
      value: stats.support_tickets ?? 0,
      description: 'Open support and moderation requests.',
      href: '/admin/support',
    },
  ];

  if (loading) {
    return (
      <main className="dashboard-page admin-dashboard-page admin-dashboard-page--loading">
        <div className="admin-loading-card">
          <p className="eyebrow">Admin dashboard</p>
          <h1>Loading overview</h1>
          <p>Fetching the latest platform counts and access checks.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page admin-dashboard-page">
      <header className="topbar admin-topbar">
        <Link className="brand-lockup brand-lockup--clickable" href="/" aria-label="Home Buddy Connect Limited home">
          <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
          <div>
            <div className="brand-name">Home Buddy Connect Limited</div>
            <div className="brand-tagline">Admin dashboard</div>
          </div>
        </Link>

        <div className="topbar-tags admin-topbar-tags" aria-label="Admin quick links">
          <span>Moderation</span>
          <span>Verification</span>
          <span>Support</span>
        </div>

        <button type="button" onClick={handleLogout} className="primary-button admin-logout-button">
          Logout
        </button>
      </header>

      <div className="dashboard-container admin-dashboard-container">
        <section className="admin-hero">
          <div>
            <p className="eyebrow">Platform overview</p>
            <h1>Minimal, role-locked control room for the marketplace.</h1>
            <p>
              Review accounts, property flow, and support workload from one place. Each metric card routes to a more
              detailed area that can be expanded later.
            </p>
          </div>

          <div className="admin-hero-panel">
            <span>Summary</span>
            <strong>{dashboardItems.length} tracked metrics</strong>
            <p>Data is pulled directly from the database on every page load.</p>
          </div>
        </section>

        {error ? <div className="admin-error-banner">{error}</div> : null}

        <section className="admin-stats-grid" aria-label="Admin dashboard metrics">
          {dashboardItems.map((item) => (
            <Link key={item.label} href={item.href} className="admin-stat-card">
              <div className="admin-stat-card__head">
                <span className="admin-stat-card__label">{item.label}</span>
                <span className="admin-stat-card__arrow" aria-hidden="true">↗</span>
              </div>
              <strong className="admin-stat-card__value">{Number(item.value).toLocaleString()}</strong>
              <p className="admin-stat-card__description">{item.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
