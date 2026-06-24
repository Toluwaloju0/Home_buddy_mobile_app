'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '../../../../lib/api';
import AdminHeader from '../../../components/AdminHeader';

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

function formatPrice(value) {
  if (!value) {
    return 'Not recorded';
  }

  const numberValue = Number(String(value).replace(/[^\d.]/g, ''));
  if (Number.isNaN(numberValue) || numberValue <= 0) {
    return value;
  }

  return `NGN ${numberValue.toLocaleString()}`;
}

function AdminPendingPropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(Number(searchParams.get('page') || 1), 1);
  const perPage = 20;

  const [properties, setProperties] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: perPage, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProperties() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/admin/properties/pending?page=${page}&per_page=${perPage}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json().catch(() => null);

        if (response.status === 401 || response.status === 205) {
          router.replace('/admin/login');
          return;
        }

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load pending properties');
        }

        if (!isMounted) {
          return;
        }

        setProperties(data?.payload?.properties || []);
        setMeta(data?.payload?.meta || { page, per_page: perPage, total: 0, total_pages: 0 });
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load pending properties');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, [page, router]);

  const pageSummary = useMemo(() => {
    if (!meta.total) {
      return '0 pending listings';
    }

    const start = (meta.page - 1) * meta.per_page + 1;
    const end = Math.min(meta.page * meta.per_page, meta.total);
    return `${start}-${end} of ${meta.total.toLocaleString()} pending listings`;
  }, [meta]);

  return (
    <main className="dashboard-page admin-dashboard-page">
      <AdminHeader tagline="Pending property listings" backHref="/admin" backLabel="Dashboard" />

      <div className="dashboard-container admin-dashboard-container">
        <section className="admin-list-header">
          <div>
            <p className="eyebrow">Property review</p>
            <h1>Listings awaiting approval</h1>
          </div>
          <div className="admin-list-summary">{loading ? 'Loading properties' : pageSummary}</div>
        </section>

        {error ? <div className="admin-error-banner">{error}</div> : null}

        <section className="admin-table-shell" aria-label="Pending property listings">
          <div className="admin-properties-table">
            <div className="admin-properties-row admin-properties-row--head">
              <span>Property</span>
              <span>Location</span>
              <span>Price</span>
              <span>Category</span>
              <span>Submitted</span>
            </div>

            {loading ? (
              <div className="admin-empty-state">Loading pending property listings...</div>
            ) : properties.length ? (
              properties.map((property) => (
                <Link key={property._id} href={`/admin/properties/pending/${property._id}`} className="admin-properties-row">
                  <span className="admin-user-name">{property.title || 'Untitled property'}</span>
                  <span>{property.location || property.full_address || 'No location'}</span>
                  <span>{formatPrice(property.price)}</span>
                  <span className="admin-pill">{property.category || property.property_type || 'property'}</span>
                  <span>{formatDate(property.created_at)}</span>
                </Link>
              ))
            ) : (
              <div className="admin-empty-state">No pending property listings found.</div>
            )}
          </div>
        </section>

        <div className="admin-pagination">
          <Link
            href={`/admin/properties/pending?page=${Math.max(page - 1, 1)}`}
            className={`admin-page-button ${page <= 1 ? 'admin-pagination__disabled' : ''}`}
            aria-disabled={page <= 1}
          >
            Previous
          </Link>
          <span>
            Page {meta.page || page} of {Math.max(meta.total_pages || 1, 1)}
          </span>
          <Link
            href={`/admin/properties/pending?page=${page + 1}`}
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

export default function AdminPendingPropertiesPage() {
  return (
    <Suspense
      fallback={
        <main className="dashboard-page admin-dashboard-page">
          <div className="admin-loading-card">
            <p className="eyebrow">Pending properties</p>
            <h1>Loading listings</h1>
            <p>Preparing the property review queue.</p>
          </div>
        </main>
      }
    >
      <AdminPendingPropertiesContent />
    </Suspense>
  );
}
