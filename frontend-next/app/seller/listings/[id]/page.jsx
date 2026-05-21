'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../../lib/api';
import UserAvatar from '../../../components/UserAvatar';

function ListingDetailContent() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id;

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadListing() {
      const response = await authFetch(`${API_BASE_URL}/seller/listings/${listingId}`, {
        method: 'GET',
      });

      if (!response) {
        if (mounted) setLoading(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (!mounted) return;

      if (response.status === 200 && data?.payload) {
        const listingData = data.payload;
        setListing(listingData);

        // Collect all images with metadata
        const images = [];
        if (listingData.media) {
          Object.entries(listingData.media).forEach(([groupKey, filesList]) => {
            if (Array.isArray(filesList)) {
              filesList.forEach((file) => {
                if (file.url) {
                  images.push({
                    url: file.url,
                    type: file.image_type || groupKey,
                    number: file.image_number || 1,
                    filename: file.filename,
                  });
                }
              });
            }
          });
        }
        setAllImages(images);
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

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });

      if (response.status === 200) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userImageUrl = user?.image_url || '';

  const renderHeader = () => (
    <header className="topbar seller-topbar">
      <div className="brand-lockup" aria-label="Home Buddy">
        <img src="/home_buddy_logo.png" alt="Home Buddy" className="brand-logo" />
        <div>
          <div className="brand-name">Home Buddy</div>
          <div className="brand-tagline">Verified housing platform</div>
        </div>
      </div>

      <div className="topbar-tags" aria-hidden="true">
        <span>Sell</span>
        <span>Agents</span>
        <span>Facility Mgt</span>
      </div>

      <div className="seller-user-menu">
        <button
          type="button"
          className="profile-trigger"
          onClick={() => setDropdownOpen((previous) => !previous)}
          aria-expanded={dropdownOpen}
          aria-haspopup="menu"
        >
          <UserAvatar src={userImageUrl} name={user?.first_name || 'User'} size="sm" className="profile-avatar-shell" />
          <span className="profile-name">{user?.first_name || 'User'}</span>
          <span className="profile-caret" aria-hidden="true">▾</span>
        </button>

        {dropdownOpen && (
          <div className="profile-dropdown" role="menu">
            <div className="profile-dropdown-header">
              <UserAvatar src={userImageUrl} name={user?.first_name || 'User'} size="lg" className="profile-dropdown-avatar-shell" />
              <strong>{user?.first_name || 'User'}</strong>
            </div>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller')}>Dashboard</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/listings')}>My Listings</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/listings/new')}>Add Listing</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={handleLogout}>Log out</button>
          </div>
        )}
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="brand-lockup brand-lockup--footer" aria-label="Home Buddy">
            <img src="/home_buddy_logo.png" alt="Home Buddy" className="brand-logo" />
            <div>
              <div className="brand-name">Home Buddy</div>
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
        <div className="footer-copy">© 2026 Home Buddy. All rights reserved.</div>
      </div>
    </footer>
  );

  if (loading) {
    return (
      <main className="page-shell">
        {renderHeader()}
        <div className="listing-detail-loading">Loading listing details...</div>
        {renderFooter()}
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="page-shell">
        {renderHeader()}
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

  return (
    <main className="page-shell listing-detail-page">
      {renderHeader()}

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
                alt={`${currentImage?.type} ${currentImage?.number}`}
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
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
                    alt={`${img.type} ${img.number}`}
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg';
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
            <h1>{listing.title}</h1>
            <p className="listing-location">
              📍 {listing.location || listing.full_address || 'Location not specified'}
            </p>
          </div>
          <div className="listing-price-section">
            <p className="listing-price">₦{listing.price ? parseInt(listing.price).toLocaleString() : 'N/A'}</p>
            {listing.is_negotiable && <span className="negotiable-tag">Negotiable</span>}
          </div>
        </section>

        {/* Key Features */}
        <section className="key-features">
          <h2>Key Features</h2>
          <div className="features-grid">
            {listing.number_of_bedrooms && (
              <div className="feature-item">
                <span className="feature-icon">🛏️</span>
                <span className="feature-text">{listing.number_of_bedrooms} Bedroom{listing.number_of_bedrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {listing.number_of_bathrooms && (
              <div className="feature-item">
                <span className="feature-icon">🚿</span>
                <span className="feature-text">{listing.number_of_bathrooms} Bathroom{listing.number_of_bathrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {listing.size_square_meters && (
              <div className="feature-item">
                <span className="feature-icon">📐</span>
                <span className="feature-text">{listing.size_square_meters} m²</span>
              </div>
            )}
            {listing.property_type && (
              <div className="feature-item">
                <span className="feature-icon">🏠</span>
                <span className="feature-text">{listing.property_type}</span>
              </div>
            )}
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
          <h2>Property Details</h2>
          <div className="details-table">
            {listing.property_type && (
              <div className="detail-row">
                <span className="detail-label">Property Type</span>
                <span className="detail-value">{listing.property_type}</span>
              </div>
            )}
            {listing.year_built && (
              <div className="detail-row">
                <span className="detail-label">Year Built</span>
                <span className="detail-value">{listing.year_built}</span>
              </div>
            )}
            {listing.listing_plan && (
              <div className="detail-row">
                <span className="detail-label">Listing Plan</span>
                <span className="detail-value">{listing.listing_plan}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value">{listing.status.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Listed Date</span>
              <span className="detail-value">{new Date(listing.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </section>

        {/* Image Breakdown */}
        {allImages.length > 0 && (
          <section className="image-breakdown">
            <h2>Uploaded Images</h2>
            <div className="images-list">
              {allImages.map((img, idx) => (
                <div key={idx} className="image-item">
                  <img
                    src={img.url}
                    alt={`${img.type} ${img.number}`}
                    className="image-thumbnail"
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="image-info">
                    <p className="image-type">{img.type} {img.number}</p>
                    <p className="image-filename">{img.filename}</p>
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
