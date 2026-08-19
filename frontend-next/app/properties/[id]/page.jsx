'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserRoleHeader from '../../components/UserRoleHeader';
import UserAvatar from '../../components/UserAvatar';
import { API_BASE_URL } from '../../../lib/api';

const footerPrimaryLinks = [
  { label: 'Contact', href: '/contact' },
  { label: 'About Us', href: '/about-us' },
  { label: 'Our Services', href: '/services' },
  { label: 'Login', href: '/login' },
  { label: 'Register', href: '/signup' },
  { label: 'Support', href: '/support' },
];

const footerSecondaryLinks = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Careers', href: '/careers' },
];

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Price on request';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

function titleCase(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getMediaItems(listing) {
  const media = Array.isArray(listing?.listing_media) ? listing.listing_media : [];
  return media
    .flatMap((item) => Object.entries(item || {}).map(([key, url]) => ({ key, label: titleCase(key), url })))
    .filter((item) => typeof item.url === 'string' && item.url.length > 0);
}

function placeholderFor(type) {
  const normalized = String(type || '').toLowerCase();
  if (normalized === 'shop') return '/placeholders/shop.svg';
  if (normalized === 'land') return '/placeholders/land.svg';
  return '/placeholders/apartment.svg';
}

function Footer() {
  return (
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
          <p>A trusted real estate platform for verified property discovery, seller onboarding, and role-based dashboards.</p>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <ul className="footer-column">
            {footerPrimaryLinks.map((link) => (
              <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
            ))}
          </ul>
          <ul className="footer-column">
            {footerSecondaryLinks.map((link) => (
              <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="footer-bottom">
        <div className="footer-copy">© 2026 Home Buddy Connect Limited. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadListing() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json().catch(() => null);

        if (!mounted) return;

        if (!response.ok && response.status !== 205) {
          throw new Error(data?.message || 'Failed to load listing');
        }

        if (response.status === 205) {
          throw new Error(data?.message || 'Your session has expired. Please log in again to view seller details.');
        }

        setListing(data?.payload || null);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load listing');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (propertyId) loadListing();

    return () => {
      mounted = false;
    };
  }, [propertyId]);

  const mediaItems = useMemo(() => getMediaItems(listing), [listing]);
  const primaryImage = mediaItems[0]?.url || placeholderFor(listing?.property_type);
  const galleryItems = mediaItems.length > 0 ? mediaItems : [{ key: 'placeholder', label: 'Property photo', url: primaryImage }];
  const galleryPreviewItems = [
    ...galleryItems.slice(1, 5),
    ...Array.from({ length: Math.max(0, 2 - galleryItems.slice(1, 5).length) }, (_, index) => ({
      key: `placeholder-${index}`,
      label: 'Property photo',
      url: placeholderFor(listing?.property_type),
    })),
  ].slice(0, 4);
  const sellerName = `${listing?.seller?.first_name || ''} ${listing?.seller?.last_name || ''}`.trim() || 'Verified seller';
  const addressParts = [listing?.building_number, listing?.street, listing?.LGA, listing?.state].filter(Boolean);
  const isForRent = listing?.for_sell === false;
  const intentLabel = isForRent ? 'For rent' : 'For sale';

  return (
    <main className="page-shell listing-detail-page">
      <UserRoleHeader fallbackTagline="Listing details" />

      <div className="listing-detail-container">
        <button type="button" className="listing-detail-back" onClick={() => router.back()}>
          <span aria-hidden="true">‹</span>
          Back to Search
        </button>

        {loading && <section className="listing-detail-loading">Loading listing...</section>}

        {!loading && error && (
          <section className="listing-detail-error">
            <p>{error}</p>
            <Link href="/search" className="buyer-primary-button">Browse listings</Link>
          </section>
        )}

        {!loading && !error && listing && (
          <>
            <section className="listing-gallery" aria-label="Property images">
              <div className="gallery-main">
                <img src={primaryImage} alt={listing.title || 'Property listing'} />
              </div>
              <div className="gallery-thumbnails">
                {galleryPreviewItems.map((item) => (
                  <figure className="thumbnail" key={`${item.key}-${item.url}`}>
                    <img src={item.url} alt={item.label} />
                  </figure>
                ))}
                {galleryItems.length > 1 && (
                  <button
                    type="button"
                    className="thumbnail-more"
                    aria-expanded={showAllPhotos}
                    aria-label={`View all ${galleryItems.length} photos`}
                    onClick={() => setShowAllPhotos((current) => !current)}
                  >
                    {showAllPhotos ? 'Hide photos' : `View all ${galleryItems.length} photos`}
                  </button>
                )}
              </div>
            </section>

            {showAllPhotos && (
              <section className="image-breakdown" aria-label="All property images">
                <h2>All photos</h2>
                <div className="images-list">
                  {galleryItems.map((item, index) => (
                    <figure className="image-item" key={`${item.key}-${item.url}-${index}`}>
                      <img className="image-thumbnail" src={item.url} alt={item.label} />
                      <figcaption className="image-info">
                        <p className="image-type">{item.label}</p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}

            <div className="listing-detail-layout">
              <div className="listing-detail-main">
                <section className="listing-header-info">
                  <div>
                    <span className={`status-pill ${isForRent ? 'status-pill--pending' : 'status-pill--confirmed'}`}>
                      {intentLabel}
                    </span>
                    <span className="status-pill status-pill--confirmed">{titleCase(listing.status || 'verified')}</span>
                    <h1>{listing.title || 'Untitled listing'}</h1>
                    <p className="listing-location">{addressParts.join(', ') || 'Location not provided'}</p>
                  </div>
                  <div className="listing-price-section">
                    <p className="listing-price">{formatCurrency(listing.price)}</p>
                    <span className="negotiable-tag">{listing.is_negotiable ? 'Negotiable' : 'Fixed price'}</span>
                  </div>
                </section>

                <section className="about-property">
                  <h2>About this {titleCase(listing.property_type || 'property')}</h2>
                  <p>{listing.description || 'No description has been added for this listing.'}</p>
                </section>

                <section className="key-features">
                  <h2>Key features</h2>
                  <div className="features-grid">
                    <div className="feature-item"><span className="feature-icon">✓</span><span className="feature-text">{titleCase(listing.property_type || 'Property')} property</span></div>
                    <div className="feature-item"><span className="feature-icon">✓</span><span className="feature-text">{listing.size_square_meters || 'N/A'} sqm size</span></div>
                    <div className="feature-item"><span className="feature-icon">✓</span><span className="feature-text">{titleCase(listing.inspection_means || 'Inspection')} inspection</span></div>
                    <div className="feature-item"><span className="feature-icon">✓</span><span className="feature-text">{listing.bathroom ? 'Bathroom available' : 'No bathroom listed'}</span></div>
                  </div>
                </section>

                <section className="property-details">
                  <h2>Property details</h2>
                  <div className="details-table">
                    <div className="detail-row"><span className="detail-label">Property type</span><span className="detail-value">{titleCase(listing.property_type)}</span></div>
                    <div className="detail-row"><span className="detail-label">State</span><span className="detail-value">{listing.state || 'N/A'}</span></div>
                    <div className="detail-row"><span className="detail-label">LGA</span><span className="detail-value">{listing.LGA || 'N/A'}</span></div>
                    <div className="detail-row"><span className="detail-label">Street</span><span className="detail-value">{listing.street || 'N/A'}</span></div>
                    <div className="detail-row"><span className="detail-label">Building number</span><span className="detail-value">{listing.building_number || 'N/A'}</span></div>
                    <div className="detail-row"><span className="detail-label">Shop number</span><span className="detail-value">{listing.shop_number || 'N/A'}</span></div>
                    <div className="detail-row"><span className="detail-label">Listing intent</span><span className="detail-value">{intentLabel}</span></div>
                  </div>
                </section>

                <section className="property-details">
                  <h2>Property stats</h2>
                  <div className="details-table">
                    <div className="detail-row"><span className="detail-label">Listed</span><span className="detail-value">Coming soon</span></div>
                    <div className="detail-row"><span className="detail-label">Views</span><span className="detail-value">Coming soon</span></div>
                    <div className="detail-row"><span className="detail-label">Inquiries</span><span className="detail-value">Coming soon</span></div>
                  </div>
                </section>

                <section className="key-features">
                  <h2>Nearby apartments</h2>
                  <div className="features-grid">
                    <div className="feature-item"><span className="feature-icon">✓</span><span className="feature-text">Nearby recommendations coming soon</span></div>
                    <div className="feature-item"><span className="feature-icon">✓</span><span className="feature-text">Distance and area matches coming soon</span></div>
                  </div>
                </section>
              </div>

              <aside className="listing-detail-sidebar">
                <section className="seller-card">
                  <h2>Seller</h2>
                  {listing.seller ? (
                    <>
                      <div className="seller-card-profile">
                        <UserAvatar src={listing.seller.image_url || ''} name={sellerName} size="lg" />
                        <div>
                          <h3>{sellerName}</h3>
                          <p>{listing.seller.is_verified ? 'Verified seller' : 'Seller'}</p>
                        </div>
                      </div>
                      <div className="seller-card-details">
                        <span>{listing.seller.email || 'Email not provided'}</span>
                        <span>{listing.seller.phone_number || 'Phone number not provided'}</span>
                      </div>
                      <a className="buyer-primary-button seller-card-action" href={`mailto:${listing.seller.email || ''}`}>
                        Send message
                      </a>
                    </>
                  ) : (
                    <div className="seller-card-locked">
                      <h3>Log in to view seller info</h3>
                      <p>Create or access your buyer account to see seller contact details and chat with sellers.</p>
                      <Link className="buyer-primary-button seller-card-action" href="/login">Login to continue</Link>
                    </div>
                  )}
                </section>
              </aside>
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
