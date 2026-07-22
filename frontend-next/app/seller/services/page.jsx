'use client';

import Link from 'next/link';
import SellerHeader from '../../components/SellerHeader';

export default function SellerServicesPage() {
  return (
    <main className="page-shell seller-page-shell">
      <SellerHeader />

      <section className="settings-card" style={{ width: 'min(100%, 1180px)', marginTop: '1.5rem' }}>
        <div className="settings-section-title">
          <h2>Home Services Marketplace</h2>
        </div>
        <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.65 }}>
          This page is a placeholder for now. Sellers will be able to advertise home services to buyers here.
        </p>
        <Link className="join-button" href="/seller" style={{ marginTop: '1rem' }}>
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}