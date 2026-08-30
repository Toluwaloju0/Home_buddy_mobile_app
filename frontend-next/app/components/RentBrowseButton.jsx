"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

export default function RentBrowseButton({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function refreshSearchSession() {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
      method: 'GET',
      credentials: 'include',
    });
    return response.status === 200;
  }

  const handleBrowseRentals = async () => {
    setLoading(true);
    setError('');
    setOpen(false);

    try {
      const url = `${API_BASE_URL}/properties/browse?page=1`;
      const requestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to_buy: false }),
      };

      let response = await fetch(url, requestInit);
      if (response.status === 205) {
        const refreshed = await refreshSearchSession();
        if (refreshed) {
          response = await fetch(url, requestInit);
        }
      }

      const data = await response.json().catch(() => ({}));
      const payload = Array.isArray(data.payload) ? data.payload : data.payload?.listings;

      if (response.status === 200 && Array.isArray(payload) && payload.length > 0) {
        router.push('/search?page=1&to_buy=false');
        return;
      }

      const noListingMessage =
        response.status === 200 && Array.isArray(payload) && payload.length === 0
          ? 'No rental listings were found at this time. Please try another location or come back later.'
          : typeof data.payload === 'string'
          ? data.payload
          : data.message || 'No listings were found.';

      setError(noListingMessage);
      setOpen(true);
    } catch (err) {
      setError('Unable to search rentals. Please try again.');
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="static-action static-action--light"
        onClick={handleBrowseRentals}
        disabled={loading}
      >
        {loading ? 'Searching...' : children}
      </button>

      {open && (
        <div
          className="search-popout-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="searchbar-popout-dialog" role="dialog" aria-modal="true">
            <button className="search-popout-close" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
                   <div className="search-popout-form">
                     <p className="searchbar-popout-message rent-popout-message" role="alert">
                       {error}
                     </p>
                   </div>
          </div>
        </div>
      )}
    </>
  );
}
