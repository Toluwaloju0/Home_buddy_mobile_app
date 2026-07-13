'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../../lib/api';
import SellerHeader from '../../../components/SellerHeader';

function ListingDetailContent() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id;

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadListing() {
      const response = await authFetch(`${API_BASE_URL}/seller/listing/all/${listingId}`, {
        method: 'GET',
      });

      if (!response) {
        if (mounted) setLoading(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (!mounted) return;

      const responsePayload = data?.payload || data;
      if (response.status === 200 && responsePayload) {
        const listingData = responsePayload;
        setListing(listingData);

        const mediaItems = [];
        if (Array.isArray(listingData.listing_media)) {
          listingData.listing_media.forEach((mediaGroup) => {
            Object.entries(mediaGroup || {}).forEach(([title, url]) => {
              if (url) {
                mediaItems.push({ title, url });
              }
            });
          });
        }
        setAllImages(mediaItems);
      } else {
        console.error('Failed to load listing:', data?.message);
      }

      setLoading(false);
    }

    async function loadUser() {
      const response = await authFetch(`${API_BASE_URL}/user/me`, {
        method: 'GET',
      });

      if (!response) return;

      const data = await response.json().catch(() => null);
      if (response.status === 200 && data?.payload) {
        setUser(data.payload);
      }
    }

    loadListing();
    loadUser();

    return () => {
      mounted = false;
    };
  }, [listingId]);

  const renderFooter = () => (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="brand-lockup brand-lockup--footer" aria-label="Home Buddy Connect Limited">
            <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
            <div>
              <div className="brand-name">Home Buddy Connect Limited</div>
              <div className="brand-tagline">Verified housing platform</div>
            </div>
          </div>
          <p>
            A trusted real estate platform for verified property discovery, seller onboarding, and role-based
            dashboards.
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <ul className="footer-column">
            <li><a href="/contact">Contact</a></li>
            <li><a href="/about-us">About Us</a></li>
            <li><a href="/services">Our Services</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/signup">Register</a></li>
            <li><a href="/support">Support</a></li>
          </ul>
          <ul className="footer-column">
            <li><a href="/terms">Terms</a></li>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/sitemap">Sitemap</a></li>
            <li><a href="/careers">Careers</a></li>
          </ul>
        </nav>
      </div>

      <div className="footer-bottom">
        <div className="footer-copy">© 2026 Home Buddy Connect Limited. All rights reserved.</div>
      </div>
    </footer>
  );

  if (loading) {
    return (
      <main className="page-shell">
        <SellerHeader user={user} loadingUser={!user} />
        <div className="listing-detail-loading">Loading listing details...</div>
        {renderFooter()}
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="page-shell">
        <SellerHeader user={user} loadingUser={!user} />
        <div className="listing-detail-error">
          <p>Listing not found or you don't have access to it.</p>
          <button onClick={() => router.back()} className="btn-primary">Go Back</button>
        </div>
        {renderFooter()}
      </main>
    );
  }

  const currentImage = allImages[currentImageIndex];
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  const formatLabel = (label) => String(label || '').replace(/_/g, ' ');
  const formatValue = (value) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === null || value === undefined || value === '') return 'N/A';
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'N/A';
    return String(value);
  };
  const detailRows = [
    ['Title', listing.title],
    ['Property Type', listing.property_type],
    ['Description', listing.description],
    ['State', listing.state],
    ['LGA', listing.LGA],
    ['Street', listing.street],
    ['Building Number', listing.building_number],
    ['Shop Number', listing.shop_number],
    ['House Number', listing.house_no],
    ['Inspection Means', listing.inspection_means],
    ['Size Square Meters', listing.size_square_meters],
    ['Status', listing.status],
    ['Negotiable', listing.is_negotiable],
    ['Bathroom', listing.bathroom],
    ['Bedrooms', listing.number_of_bedrooms],
    ['Bathrooms', listing.number_of_bathrooms],
    ['Year Built', listing.year_built],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');

  return (
    <main className="page-shell listing-detail-page">
      <SellerHeader user={user} loadingUser={!user} />

      <div className="listing-detail-container">
        <button
          type="button"
          className="back-button listing-detail-back"
          onClick={() => router.back()}
        >
          ← Back
        </button>

        {listing.status === 'pending_approval' && (
          <div className="listing-detail-alert">
            ⚠️ This listing is under review by our admin team. Check back soon!
          </div>
        )}

        {/* Image Gallery */}
        {allImages.length > 0 && (
          <section className="listing-gallery">
            <div className="gallery-main">
              <img
                src={currentImage?.url}
                alt={formatLabel(currentImage?.title)}
                onError={(e) => {
                  e.currentTarget.src = '/placeholders/apartment.svg';
                }}
              />
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-nav gallery-nav-prev"
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="gallery-nav gallery-nav-next"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
              <div className="gallery-counter">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="gallery-thumbnails">
              {allImages.slice(0, 4).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <img
                    src={img.url}
                    alt={formatLabel(img.title)}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholders/apartment.svg';
                    }}
                  />
                </button>
              ))}
              {allImages.length > 4 && (
                <div className="thumbnail-more">
                  <span>+{allImages.length - 4}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Listing Header Info */}
        <section className="listing-header-info">
          <div>
            <h1>{listing.title || listing.description || 'Listing detail'}</h1>
            <p className="listing-location">
              {listing.property_type ? formatLabel(listing.property_type) : 'Property type not specified'}
            </p>
          </div>
          <div className="listing-price-section">
            <p className="listing-price">₦{listing.price ? parseInt(listing.price).toLocaleString() : 'N/A'}</p>
            {listing.is_negotiable && <span className="negotiable-tag">Negotiable</span>}
            {listing.status ? <span className="negotiable-tag">{formatLabel(listing.status)}</span> : null}
          </div>
        </section>

        {/* About the Property */}
        {listing.description && (
          <section className="about-property">
            <h2>About This Property</h2>
            <p>{listing.description}</p>
          </section>
        )}

        {/* Property Details Table */}
        <section className="property-details">
          <h2>Listing Details</h2>
          <div className="details-table">
            {detailRows.map(([label, value]) => (
              <div className="detail-row" key={label}>
                <span className="detail-label">{label}</span>
                <span className="detail-value">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Image Breakdown */}
        {allImages.length > 0 && (
          <section className="image-breakdown">
            <h2>Listing Media</h2>
            <div className="images-list">
              {allImages.map((img, idx) => (
                <div key={idx} className="image-item">
                  <img
                    src={img.url}
                    alt={formatLabel(img.title)}
                    className="image-thumbnail"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholders/apartment.svg';
                    }}
                  />
                  <div className="image-info">
                    <p className="image-type">{formatLabel(img.title)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {renderFooter()}
    </main>
  );
}

export default function ListingDetailPage() {
  return (
    <Suspense fallback={<div className="page-shell">Loading...</div>}>
      <ListingDetailContent />
    </Suspense>
  );
}
