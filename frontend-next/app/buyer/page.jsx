'use client';

import Link from 'next/link';

export default function BuyerPage() {
  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Buyer Dashboard</h1>
          <Link href="/login" className="logout-link">
            Logout
          </Link>
        </header>

        <div className="dashboard-content">
          <p>Welcome to your buyer dashboard. This page is under development.</p>
          <div className="features-list">
            <h2>Coming Soon:</h2>
            <ul>
              <li>Search and filter properties</li>
              <li>View property details</li>
              <li>Request property inspections</li>
              <li>Manage saved listings</li>
              <li>Track escrow transactions</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
