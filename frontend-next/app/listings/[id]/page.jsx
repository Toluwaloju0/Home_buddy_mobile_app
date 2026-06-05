'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../lib/api';

function resolveImage(listing) {
  if (!listing) return '/home_buddy_logo.png';
  if (listing.image) return listing.image;
  if (Array.isArray(listing.images) && listing.images.length > 0) {
    const first = listing.images[0];
    return typeof first === 'string' ? first : first.url || first.path || '/home_buddy_logo.png';
  }
  if (listing.media && Array.isArray(listing.media.images) && listing.media.images.length > 0) {
    const first = listing.media.images[0];
    return typeof first === 'string' ? first : first.url || first.path || '/home_buddy_logo.png';
  }
  return '/home_buddy_logo.png';
}

export default function ListingDetail() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        const id = path.split('/').filter(Boolean).pop();
        if (!id) return;

        const res = await authFetch(`${API_BASE_URL}/properties/${id}`, { method: 'GET' });
        if (!res) {
          redirectToLogin();
          return;
        }

        if (res.status === 205) {
          // token refresh attempt already handled by authFetch; if still 205, redirect
          redirectToLogin();
          return;
        }

        const data = await res.json().catch(() => null);
        if (!mounted) return;

        if (res.status === 200 && data?.payload) {
          setListing(data.payload);
        } else {
          // couldn't fetch listing, redirect to listings
          window.location.href = '/listings';
        }
      } catch (err) {
        // fallback
        window.location.href = '/listings';
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <main className="listing-detail">Loading...</main>;
  if (!listing) return <main className="listing-detail">Listing not found.</main>;

  const img = resolveImage(listing);

  return (
    <main className="listing-detail">
      <div className="listing-header">
        <Link href="/listings">← Back to listings</Link>
      </div>

      <div className="listing-main">
        <img src={img} alt={listing.title || 'Property'} className="listing-main-image" />
        <div className="listing-info">
          <h1>{listing.title || listing.submission_id}</h1>
          <p className="listing-price">{listing.price || listing.price_display || listing.rent || ''}</p>
          <p className="listing-location">{listing.location || listing.full_address}</p>
          <div className="listing-description">
            <p>{listing.description || 'No description provided.'}</p>
          </div>

          <div className="listing-meta">
            {listing.number_of_bedrooms && <div>Bedrooms: {listing.number_of_bedrooms}</div>}
            {listing.number_of_bathrooms && <div>Bathrooms: {listing.number_of_bathrooms}</div>}
            {listing.size_square_meters && <div>Size: {listing.size_square_meters}</div>}
          </div>
        </div>
      </div>
    </main>
  );
}
