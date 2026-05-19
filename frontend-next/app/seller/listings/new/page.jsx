'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../../lib/api';
import UserAvatar from '../../../components/UserAvatar';

const listingTypeCards = [
  {
    key: 'apartment',
    title: 'Apartment',
    description: 'Residential homes, flats and short-let units',
    icon: '🏢',
  },
  {
    key: 'land',
    title: 'Land',
    description: 'Plots, estates and undeveloped land',
    icon: '🌳',
  },
  {
    key: 'shop',
    title: 'Shop',
    description: 'Shops, office spaces and commercial units',
    icon: '🏪',
  },
];

const documentFields = [
  { key: 'title_document', label: 'Title Document', required: true },
  { key: 'proof_of_ownership', label: 'Proof of Ownership', required: true },
  { key: 'tax_clearance_certificate', label: 'Tax Clearance Certificate', required: false },
  { key: 'approved_building_plan', label: 'Approved Building Plan', required: false },
  { key: 'structural_integrity_report', label: 'Structural Integrity Report', required: false },
  { key: 'estate_dues_receipt', label: 'Estate Dues Receipt', required: false },
  { key: 'occupancy_permit', label: 'Occupancy Permit', required: false },
  { key: 'utility_bill', label: 'Utility Bill', required: false },
];

const apartmentImageGroups = [
  { key: 'exterior_images', label: 'Exterior Photos', required: true, hint: 'Front, back and side views of the property' },
  { key: 'sitting_room_images', label: 'Sitting Room', required: true, hint: 'At least one sitting room image' },
  { key: 'bedroom_images', label: 'Bedroom Photos', required: true, hint: 'Upload the bedrooms and number each room clearly' },
  { key: 'kitchen_images', label: 'Kitchen', required: true, hint: 'Kitchen and pantry images' },
  { key: 'bathroom_images', label: 'Bathroom', required: true, hint: 'Bathroom and toilet areas' },
  { key: 'other_interior_images', label: 'Other Interior Rooms', required: false, hint: 'Study, dining, store or any other available room' },
  { key: 'garden_images', label: 'Garden / Compound', required: false, hint: 'Optional exterior landscape or compound photos' },
  { key: 'gym_images', label: 'Gym / Shared Amenities', required: false, hint: 'Optional shared facility images' },
];

function createEmptyMediaState() {
  return documentFields.reduce((accumulator, field) => {
    accumulator[field.key] = [];
    return accumulator;
  }, {
    exterior_images: [],
    sitting_room_images: [],
    bedroom_images: [],
    kitchen_images: [],
    bathroom_images: [],
    other_interior_images: [],
    garden_images: [],
    gym_images: [],
  });
}

function NewListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams?.get('type') || '';

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [propertyType, setPropertyType] = useState('Flat');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [sizeSquareMeters, setSizeSquareMeters] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [listingPlan, setListingPlan] = useState('Basic');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [media, setMedia] = useState(createEmptyMediaState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const response = await authFetch(`${API_BASE_URL}/user/me`, {
        method: 'GET',
      });

      if (!response) {
        if (mounted) setLoadingUser(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (!mounted) return;

      if (response.status === 200 && data?.payload) {
        setUser(data.payload);
      } else {
        redirectToLogin();
      }

      setLoadingUser(false);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const displayName = useMemo(() => {
    if (!user) return 'Loading';

    const first = user.first_name || '';
    const last = user.last_name || '';
    const full = `${first} ${last}`.trim();

    if (full) return full;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  }, [user]);

  const userImageUrl = user?.image_url || '';

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      const response = await authFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });

      const data = await response.json().catch(() => null);

      if (response.status === 200) {
        router.push('/login');
      } else {
        alert(data?.message || 'Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  const updateMediaGroup = (groupKey, files) => {
    setMedia((previous) => ({
      ...previous,
      [groupKey]: Array.from(files || []),
    }));
  };

  const selectType = (selectedType) => {
    setType(selectedType);
    router.replace(`/seller/listings/new?type=${selectedType}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type) {
      alert('Please select a listing type.');
      return;
    }

    setSubmitting(true);

    try {
      const form = new FormData();
      form.append('title', title || `${type} listing`);
      form.append('category', type);
      form.append('price', price || '0');
      form.append('location', location || '');
      form.append('description', description || '');
      form.append('year_built', yearBuilt || '');
      form.append('property_type', propertyType || '');
      form.append('number_of_bedrooms', bedrooms || '');
      form.append('number_of_bathrooms', bathrooms || '');
      form.append('size_square_meters', sizeSquareMeters || '');
      form.append('full_address', fullAddress || '');
      form.append('listing_plan', listingPlan || 'Basic');
      form.append('save_mode', 'draft');
      form.append('is_negotiable', isNegotiable ? 'true' : 'false');

      Object.entries(media).forEach(([groupKey, files]) => {
        files.forEach((file) => {
          form.append(groupKey, file);
        });
      });

      const response = await authFetch(`${API_BASE_URL}/seller/listings/submit`, {
        method: 'POST',
        body: form,
      });

      const data = await response.json().catch(() => null);
      if (response.status === 200 && data?.status) {
        alert('Listing submitted successfully');
        router.push('/seller');
        return;
      }

      alert(data?.message || 'Failed to submit listing.');
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderHeader = () => (
    <header className="topbar seller-topbar">
      <div className="brand-lockup" aria-label="Home Buddy">
        <span className="brand-mark" />
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
          <UserAvatar src={userImageUrl} name={displayName} size="sm" className="profile-avatar-shell" />
          <span className="profile-name">{loadingUser ? 'Loading...' : displayName}</span>
          <span className="profile-caret" aria-hidden="true">▾</span>
        </button>

        {dropdownOpen && (
          <div className="profile-dropdown" role="menu">
            <div className="profile-dropdown-header">
              <UserAvatar src={userImageUrl} name={displayName} size="lg" className="profile-dropdown-avatar-shell" />
              <strong>{displayName}</strong>
            </div>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller')}>Dashboard</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/messages')}>Messages</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/profile-settings')}>Profile Settings</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/listings/new')}>Add Listing</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={handleLogout}>Log out</button>
          </div>
        )}
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer className="footer">
      <div className="footer-brand">
        <div className="brand-lockup brand-lockup--footer" aria-label="Home Buddy">
          <span className="brand-mark" />
          <div>
            <div className="brand-name">Home Buddy</div>
            <div className="brand-tagline">Verified housing platform</div>
          </div>
        </div>
        <p>
          Home Buddy is a trusted real estate platform that helps you sell verified properties with confidence.
        </p>
      </div>
      <div className="footer-copy">© 2026 Home Buddy. All rights reserved.</div>
    </footer>
  );

  if (!type) {
    return (
      <main className="page-shell seller-page-shell">
        {renderHeader()}

        <section className="listing-type-select">
          <div className="type-select-content">
            <h1>List Your Property for Sale</h1>
            <p>Select the type of property you want to sell</p>

            <div className="type-grid">
              {listingTypeCards.map((card) => (
                <button
                  type="button"
                  key={card.key}
                  className={`type-card ${type === card.key ? 'type-card--selected' : ''}`}
                  onClick={() => selectType(card.key)}
                >
                  <div className="type-card-icon" aria-hidden="true">{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn-continue"
              onClick={() => selectType(type || 'apartment')}
            >
              Continue
            </button>
          </div>
        </section>

        {renderFooter()}
      </main>
    );
  }

  return (
    <main className="page-shell seller-page-shell">
      {renderHeader()}

      <form className="listing-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <button type="button" className="back-button" onClick={() => router.back()}>&larr; Back</button>
          <h1>{type === 'apartment' ? 'List Your Apartment for Sale' : `List Your ${type.charAt(0).toUpperCase() + type.slice(1)}`}</h1>
        </div>

        <p className="form-subtitle">Upload the images and documents buyers need to review before they contact you.</p>


        <section className="settings-card listing-section-card">
          <div className="settings-section-title">
            <h2>Property Information</h2>
            <span>Tell buyers what they are looking at</span>
          </div>

          <div className="listing-form-grid">
            <label className="field-item">
              <span>Property Type</span>
              <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
                <option>Flat</option>
                <option>Mini Flat</option>
                <option>Duplex</option>
                <option>Penthouse</option>
                <option>Bungalow</option>
                <option>Shop</option>
                <option>Land</option>
              </select>
            </label>

            <label className="field-item">
              <span>Year Built</span>
              <input value={yearBuilt} onChange={(event) => setYearBuilt(event.target.value)} placeholder="e.g. 2019" />
            </label>

            <label className="field-item">
              <span>Number of Bedrooms</span>
              <select value={bedrooms} onChange={(event) => setBedrooms(event.target.value)}>
                <option value="">Select</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5+</option>
              </select>
            </label>

            <label className="field-item">
              <span>Number of Bathrooms</span>
              <select value={bathrooms} onChange={(event) => setBathrooms(event.target.value)}>
                <option value="">Select</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4+</option>
              </select>
            </label>

            <label className="field-item">
              <span>Size (Square Meters)</span>
              <input value={sizeSquareMeters} onChange={(event) => setSizeSquareMeters(event.target.value)} placeholder="e.g. 1634" />
            </label>

            <label className="field-item">
              <span>Selling Price (N)</span>
              <input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="e.g. 1000000" />
              <small className="field-note">
                <input type="checkbox" checked={isNegotiable} onChange={(event) => setIsNegotiable(event.target.checked)} />
                Price is negotiable
              </small>
            </label>

            <label className="field-item field-item--wide">
              <span>Location</span>
              <select value={location} onChange={(event) => setLocation(event.target.value)}>
                <option value="">Select</option>
                <option>Ajah</option>
                <option>Lekki</option>
                <option>Ikeja</option>
                <option>Ikoyi</option>
                <option>Victoria Island</option>
              </select>
            </label>

            <label className="field-item field-item--wide">
              <span>Full Address</span>
              <input value={fullAddress} onChange={(event) => setFullAddress(event.target.value)} placeholder="Street address, landmark, city" />
            </label>

            <label className="field-item field-item--wide">
              <span>Detailed Description</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} placeholder="Describe the property, nearby landmarks, and what makes it special" />
            </label>

            <label className="field-item">
              <span>Listing Plan</span>
              <select value={listingPlan} onChange={(event) => setListingPlan(event.target.value)}>
                <option>Basic</option>
                <option>Standard</option>
                <option>Premium</option>
              </select>
            </label>

            <label className="field-item">
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Listing headline" />
            </label>
          </div>
        </section>

        {type === 'apartment' && (
          <>
            <section className="settings-card listing-section-card">
              <div className="settings-section-title">
                <h2>Property Photos</h2>
                <span>Exterior and interior images are required</span>
              </div>

              <div className="media-grid">
                {apartmentImageGroups.map((group) => (
                  <label key={group.key} className="media-upload-card">
                    <span className="media-upload-title">
                      {group.label}
                      {group.required ? <em>Required</em> : <small>Optional</small>}
                    </span>
                    <span className="media-upload-hint">{group.hint}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(event) => updateMediaGroup(group.key, event.target.files)}
                    />
                    <span className="media-upload-count">
                      {media[group.key]?.length ? `${media[group.key].length} file(s) selected` : 'Choose files'}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="settings-card listing-section-card">
              <div className="settings-section-title">
                <h2>Required Documents</h2>
                <span>Upload the property papers that appear in the listing preview</span>
              </div>

              <div className="document-grid">
                {documentFields.map((field) => (
                  <label key={field.key} className="document-upload-card">
                    <span className="media-upload-title">
                      {field.label}
                      {field.required ? <em>Required</em> : <small>Optional</small>}
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(event) => updateMediaGroup(field.key, event.target.files)}
                    />
                    <span className="media-upload-count">
                      {media[field.key]?.length ? `${media[field.key].length} file(s) selected` : 'Choose file'}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </>
        )}

        {type !== 'apartment' && (
          <section className="settings-card listing-section-card">
            <div className="settings-section-title">
              <h2>Property Photos</h2>
              <span>Upload the main images for this listing</span>
            </div>
            <label className="file-drop listing-dropzone">
              <input type="file" multiple accept="image/*" onChange={(event) => updateMediaGroup('exterior_images', event.target.files)} />
              <div className="file-drop-inner">
                <strong>Drag & drop photos here</strong>
                <span>or click to choose listing images</span>
              </div>
            </label>
          </section>
        )}

        <section className="settings-card listing-section-card">
          <div className="settings-section-title">
            <h2>Property Information</h2>
            <span>Tell buyers what they are looking at</span>
          </div>

          <div className="listing-form-grid">
            <label className="field-item">
              <span>Property Type</span>
              <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
                <option>Flat</option>
                <option>Mini Flat</option>
                <option>Duplex</option>
                <option>Penthouse</option>
                <option>Bungalow</option>
                <option>Shop</option>
                <option>Land</option>
              </select>
            </label>

            <label className="field-item">
              <span>Year Built</span>
              <input value={yearBuilt} onChange={(event) => setYearBuilt(event.target.value)} placeholder="e.g. 2019" />
            </label>

            <label className="field-item">
              <span>Number of Bedrooms</span>
              <select value={bedrooms} onChange={(event) => setBedrooms(event.target.value)}>
                <option value="">Select</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5+</option>
              </select>
            </label>

            <label className="field-item">
              <span>Number of Bathrooms</span>
              <select value={bathrooms} onChange={(event) => setBathrooms(event.target.value)}>
                <option value="">Select</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4+</option>
              </select>
            </label>

            <label className="field-item">
              <span>Size (Square Meters)</span>
              <input value={sizeSquareMeters} onChange={(event) => setSizeSquareMeters(event.target.value)} placeholder="e.g. 1634" />
            </label>

            <label className="field-item">
              <span>Selling Price (N)</span>
              <input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="e.g. 1000000" />
              <small className="field-note">
                <input type="checkbox" checked={isNegotiable} onChange={(event) => setIsNegotiable(event.target.checked)} />
                Price is negotiable
              </small>
            </label>

            <label className="field-item field-item--wide">
              <span>Location</span>
              <select value={location} onChange={(event) => setLocation(event.target.value)}>
                <option value="">Select</option>
                <option>Ajah</option>
                <option>Lekki</option>
                <option>Ikeja</option>
                <option>Ikoyi</option>
                <option>Victoria Island</option>
              </select>
            </label>

            <label className="field-item field-item--wide">
              <span>Full Address</span>
              <input value={fullAddress} onChange={(event) => setFullAddress(event.target.value)} placeholder="Street address, landmark, city" />
            </label>

            <label className="field-item field-item--wide">
              <span>Detailed Description</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} placeholder="Describe the property, nearby landmarks, and what makes it special" />
            </label>

            <label className="field-item">
              <span>Listing Plan</span>
              <select value={listingPlan} onChange={(event) => setListingPlan(event.target.value)}>
                <option>Basic</option>
                <option>Standard</option>
                <option>Premium</option>
              </select>
            </label>

            <label className="field-item">
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Listing headline" />
            </label>
          </div>
        </section>

        <div className="form-actions listing-form-actions">
          <button type="button" className="btn-secondary" onClick={() => setType('')}>Back to Types</button>
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Listing'}</button>
        </div>
      </form>

      {renderFooter()}
    </main>
  );
}

export default function NewListingPage() {
  return (
    <Suspense fallback={<div className="page-shell">Loading...</div>}>
      <NewListingContent />
    </Suspense>
  );
}