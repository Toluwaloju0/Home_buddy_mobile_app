'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '../../../../../lib/api';
import AdminHeader from '../../../../components/AdminHeader';

const DOCUMENT_GROUPS = new Set([
  'title_document',
  'proof_of_ownership',
  'tax_clearance_certificate',
  'approved_building_plan',
  'structural_integrity_report',
  'estate_dues_receipt',
  'occupancy_permit',
  'utility_bill',
]);

function formatDateTime(value) {
  if (!value) {
    return 'Not recorded';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not recorded';
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

function displayValue(value) {
  return value || 'Not recorded';
}

function imageGroupLabel(groupKey, files) {
  const firstLabel = files.find((file) => file?.image_type)?.image_type;
  return firstLabel || groupKey.replaceAll('_', ' ');
}

function collectMedia(media) {
  const imageGroups = [];
  const documents = [];

  if (!media || typeof media !== 'object') {
    return { imageGroups, documents };
  }

  Object.entries(media).forEach(([groupKey, files]) => {
    if (!Array.isArray(files)) {
      return;
    }

    const groupImages = [];

    files.forEach((file, index) => {
      if (!file?.url) {
        return;
      }

      const item = {
        ...file,
        groupKey,
        label: file.image_type || groupKey.replaceAll('_', ' '),
        number: file.image_number || index + 1,
      };

      if (DOCUMENT_GROUPS.has(groupKey)) {
        documents.push(item);
      } else {
        groupImages.push(item);
      }
    });

    if (groupImages.length) {
      imageGroups.push({
        groupKey,
        label: imageGroupLabel(groupKey, groupImages),
        images: groupImages,
      });
    }
  });

  return { imageGroups, documents };
}

export default function AdminPendingPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProperty() {
      if (!propertyId) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json().catch(() => null);

        if (response.status === 401 || response.status === 205) {
          router.replace('/admin/login');
          return;
        }

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load property listing');
        }

        if (isMounted) {
          setProperty(data?.payload || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load property listing');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, [propertyId, router]);

  const { imageGroups, documents } = useMemo(() => collectMedia(property?.media), [property]);
  const isReviewing = Boolean(reviewAction);
  const canReview = property?.status === 'pending_approval';

  const handleReviewAction = async (action) => {
    if (!propertyId || isReviewing) {
      return;
    }

    setReviewAction(action);
    setReviewMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401 || response.status === 205) {
        router.replace('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || `Failed to ${action} property listing`);
      }

      setProperty(data?.payload || property);
      setReviewMessage(data?.message || `Property listing ${action === 'approve' ? 'approved' : 'declined'} successfully`);
    } catch (err) {
      setError(err.message || `Failed to ${action} property listing`);
    } finally {
      setReviewAction('');
    }
  };

  return (
    <main className="dashboard-page admin-dashboard-page">
      <AdminHeader tagline="Property review" backHref="/admin/properties/pending" backLabel="Pending listings" />

      <div className="dashboard-container admin-dashboard-container">
        <section className="admin-list-header">
          <div>
            <p className="eyebrow">Pending listing</p>
            <h1>{loading ? 'Loading property' : property?.title || 'Property listing'}</h1>
          </div>
          {property ? (
            <div className="admin-review-actions" aria-label="Property review actions">
              <button
                type="button"
                className="admin-review-button admin-review-button--approve"
                onClick={() => handleReviewAction('approve')}
                disabled={isReviewing || !canReview}
              >
                {reviewAction === 'approve' ? 'Approving...' : 'Approve listing'}
              </button>
              <button
                type="button"
                className="admin-review-button admin-review-button--deny"
                onClick={() => handleReviewAction('decline')}
                disabled={isReviewing || !canReview}
              >
                {reviewAction === 'decline' ? 'Denying...' : 'Deny listing'}
              </button>
            </div>
          ) : null}
        </section>

        {error ? <div className="admin-error-banner">{error}</div> : null}
        {reviewMessage ? <div className="admin-success-banner">{reviewMessage}</div> : null}

        {loading ? (
          <div className="admin-loading-card">
            <p className="eyebrow">Property details</p>
            <h1>Loading listing</h1>
            <p>Checking admin access and retrieving listing media.</p>
          </div>
        ) : property ? (
          <>
            <section className="admin-property-image-categories" aria-label="Property images by category">
              {imageGroups.length ? (
                imageGroups.map((group) => (
                  <div key={group.groupKey} className="admin-property-image-category">
                    <div className="admin-property-image-category__head">
                      <h2>{group.label}</h2>
                      <span>{group.images.length} image{group.images.length === 1 ? '' : 's'}</span>
                    </div>

                    <div className="admin-property-image-grid">
                      {group.images.map((image, index) => (
                        <figure key={`${image.groupKey}-${image.filename || index}`} className="admin-property-image-card">
                          <img src={image.url} alt={`${image.label} ${image.number}`} />
                          <figcaption>
                            <span>{image.filename || `${image.groupKey}_${image.number}`}</span>
                            <small>{image.label} {image.number}</small>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-property-images-empty">No property images uploaded.</div>
              )}
            </section>

            <section className="admin-detail-grid admin-property-detail-grid" aria-label="Property information">
              <div className="admin-detail-panel">
                <h2 className="admin-section-title">Listing details</h2>
                <dl className="admin-detail-list">
                  <div>
                    <dt>Property ID</dt>
                    <dd>{property._id}</dd>
                  </div>
                  <div>
                    <dt>Seller ID</dt>
                    <dd>{displayValue(property.seller_id)}</dd>
                  </div>
                  <div>
                    <dt>Category</dt>
                    <dd>{displayValue(property.category)}</dd>
                  </div>
                  <div>
                    <dt>Property type</dt>
                    <dd>{displayValue(property.property_type)}</dd>
                  </div>
                  <div>
                    <dt>Price</dt>
                    <dd>{formatPrice(property.price)}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{displayValue(property.location)}</dd>
                  </div>
                  <div>
                    <dt>Full address</dt>
                    <dd>{displayValue(property.full_address)}</dd>
                  </div>
                  <div>
                    <dt>Listing plan</dt>
                    <dd>{displayValue(property.listing_plan)}</dd>
                  </div>
                  <div>
                    <dt>Bedrooms</dt>
                    <dd>{displayValue(property.number_of_bedrooms)}</dd>
                  </div>
                  <div>
                    <dt>Bathrooms</dt>
                    <dd>{displayValue(property.number_of_bathrooms)}</dd>
                  </div>
                  <div>
                    <dt>Size</dt>
                    <dd>{property.size_square_meters ? `${property.size_square_meters} sqm` : 'Not recorded'}</dd>
                  </div>
                  <div>
                    <dt>Year built</dt>
                    <dd>{displayValue(property.year_built)}</dd>
                  </div>
                  <div>
                    <dt>Submitted</dt>
                    <dd>{formatDateTime(property.created_at)}</dd>
                  </div>
                  <div>
                    <dt>Last updated</dt>
                    <dd>{formatDateTime(property.updated_at)}</dd>
                  </div>
                </dl>
              </div>

              <div className="admin-detail-panel">
                <h2 className="admin-section-title">Description</h2>
                <p className="admin-property-description">{displayValue(property.description)}</p>

                <h2 className="admin-section-title admin-section-title--spaced">Uploaded documents</h2>
                {documents.length ? (
                  <div className="admin-document-list">
                    {documents.map((document, index) => (
                      <a
                        key={`${document.groupKey}-${document.filename || index}`}
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-document-link"
                      >
                        <span>{document.label}</span>
                        <small>{document.filename || 'Open upload'}</small>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="admin-property-description">No document uploads found.</p>
                )}
              </div>
            </section>
          </>
        ) : (
          <div className="admin-empty-state">Property listing not found.</div>
        )}
      </div>
    </main>
  );
}
