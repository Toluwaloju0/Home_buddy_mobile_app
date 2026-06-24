'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '../../../lib/api';
import RoleAwareHeader from '../../components/RoleAwareHeader';

function displayValue(value) {
  return value || 'Not recorded';
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

function groupLabel(groupKey, files) {
  const firstLabel = files.find((file) => file?.image_type)?.image_type;
  return firstLabel || groupKey.replaceAll('_', ' ');
}

function collectImageGroups(media) {
  if (!media || typeof media !== 'object') {
    return [];
  }

  return Object.entries(media)
    .map(([groupKey, files]) => {
      const images = Array.isArray(files) ? files.filter((file) => file?.url) : [];

      return {
        groupKey,
        label: groupLabel(groupKey, images),
        images,
      };
    })
    .filter((group) => group.images.length > 0);
}

function getHeroImage(property) {
  const groups = collectImageGroups(property?.media);
  const exteriorGroup = groups.find((group) => group.groupKey === 'exterior_images');
  return exteriorGroup?.images?.[0] || groups[0]?.images?.[0] || null;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadProperty() {
      if (!propertyId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json().catch(() => null);

        if (response.status === 401 || response.status === 205 || data?.status === false) {
          router.replace('/login');
          return;
        }

        if (!response.ok || !data?.payload) {
          throw new Error(data?.message || 'Failed to load listing');
        }

        if (mounted) {
          setProperty(data.payload);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load listing');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProperty();

    return () => {
      mounted = false;
    };
  }, [propertyId, router]);

  const imageGroups = useMemo(() => collectImageGroups(property?.media), [property]);
  const heroImage = useMemo(() => getHeroImage(property), [property]);

  return (
    <main className="property-detail-page">
      <RoleAwareHeader fallbackTagline="Property details" />

      {loading ? (
        <section className="property-detail-state">
          <h1>Loading property</h1>
          <p>Fetching the full listing details and media.</p>
        </section>
      ) : error ? (
        <section className="property-detail-state property-detail-state--error">
          <h1>Listing unavailable</h1>
          <p>{error}</p>
          <button type="button" onClick={() => router.back()}>Go back</button>
        </section>
      ) : property ? (
        <>
          <section className="property-detail-hero">
            <div className="property-detail-hero__image">
              {heroImage ? (
                <img src={heroImage.url} alt={property.title || 'Property exterior'} />
              ) : (
                <div>No listing image uploaded.</div>
              )}
            </div>

            <div className="property-detail-hero__copy">
              <p className="eyebrow">{displayValue(property.category)}</p>
              <h1>{displayValue(property.title)}</h1>
              <p className="property-detail-location">{displayValue(property.location)}</p>
              <strong className="property-detail-price">{formatPrice(property.price)}</strong>
              <p className="property-detail-description">{displayValue(property.description)}</p>
            </div>
          </section>

          <section className="property-detail-grid" aria-label="Listing information">
            <div>
              <span>Property type</span>
              <strong>{displayValue(property.property_type)}</strong>
            </div>
            <div>
              <span>Bedrooms</span>
              <strong>{displayValue(property.number_of_bedrooms)}</strong>
            </div>
            <div>
              <span>Bathrooms</span>
              <strong>{displayValue(property.number_of_bathrooms)}</strong>
            </div>
            <div>
              <span>Size</span>
              <strong>{property.size_square_meters ? `${property.size_square_meters} sqm` : 'Not recorded'}</strong>
            </div>
            <div>
              <span>Year built</span>
              <strong>{displayValue(property.year_built)}</strong>
            </div>
            <div>
              <span>Listing plan</span>
              <strong>{displayValue(property.listing_plan)}</strong>
            </div>
            <div className="property-detail-grid__wide">
              <span>Full address</span>
              <strong>{displayValue(property.full_address)}</strong>
            </div>
          </section>

          <section className="property-detail-media" aria-label="Property images">
            <div className="property-detail-section-heading">
              <p className="eyebrow">Listing media</p>
              <h2>Property images</h2>
            </div>

            {imageGroups.length ? (
              imageGroups.map((group) => (
                <div key={group.groupKey} className="property-detail-media-group">
                  <div className="property-detail-media-group__head">
                    <h3>{group.label}</h3>
                    <span>{group.images.length} image{group.images.length === 1 ? '' : 's'}</span>
                  </div>

                  <div className="property-detail-media-grid">
                    {group.images.map((image, index) => (
                      <figure key={`${group.groupKey}-${image.filename || index}`} className="property-detail-media-card">
                        <img src={image.url} alt={`${image.image_type || group.label} ${image.image_number || index + 1}`} />
                        <figcaption>
                          <span>{image.filename || `${group.groupKey}_${image.image_number || index + 1}`}</span>
                          <small>{image.image_type || group.label} {image.image_number || index + 1}</small>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="property-detail-state">No property images uploaded.</div>
            )}
          </section>
        </>
      ) : (
        <section className="property-detail-state">
          <h1>Listing not found</h1>
          <p>We could not find this property listing.</p>
        </section>
      )}
    </main>
  );
}
