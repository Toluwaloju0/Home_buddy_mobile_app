'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BuyerProfileLayout from './BuyerProfileLayout';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../lib/api';
import UserAvatar from '../../components/UserAvatar';
import { nigeriaStates, statesWithLgas } from '../../../utils/stateList';
import { amenitiesList } from '../../../utils/amenitiesList';

const initialFormState = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  imageUrl: '',
};

const initialRecommendationState = {
  state: '',
  LGA: '',
  max_price: '',
  min_price: '',
  max_size: '',
  min_size: '',
  amenities: [],
  property_type: '',
};

const PROPERTY_TYPES = ['shop', 'land', 'flat', 'mini flat', 'bungalow', 'penthouse', 'duplex'];

const MAX_PROFILE_IMAGE_BYTES = 1024 * 1024; // 1 MB

const normalizeStateName = (stateValue) => {
  const normalized = String(stateValue || '').trim().toLowerCase();
  if (!normalized) return '';

  return nigeriaStates.find((state) => state.toLowerCase() === normalized) || stateValue || '';
};

const normalizeLgaName = (stateValue, lgaValue) => {
  const normalizedState = normalizeStateName(stateValue);
  const lgas = statesWithLgas[normalizedState] || [];
  const normalizedLga = String(lgaValue || '').trim().toLowerCase();
  if (!normalizedLga) return '';

  return lgas.find((lga) => lga.toLowerCase() === normalizedLga) || lgaValue || '';
};

const normalizeRecommendationForm = (settings) => {
  if (!settings) {
    return initialRecommendationState;
  }

  return {
    state: normalizeStateName(settings.state),
    LGA: normalizeLgaName(settings.state, settings.LGA),
    max_price: settings.max_price ?? '',
    min_price: settings.min_price ?? '',
    max_size: settings.max_size ?? '',
    min_size: settings.min_size ?? '',
    amenities: Array.isArray(settings.amenities)
      ? settings.amenities.flat(Infinity).map((item) => String(item || '').trim()).filter(Boolean)
      : [],
    property_type: settings.property_type || '',
  };
};

const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const recommendationFormsEqual = (left, right) => {
  return left.state === right.state
    && left.LGA === right.LGA
    && String(left.max_price ?? '') === String(right.max_price ?? '')
    && String(left.min_price ?? '') === String(right.min_price ?? '')
    && String(left.max_size ?? '') === String(right.max_size ?? '')
    && String(left.min_size ?? '') === String(right.min_size ?? '')
    && String(left.property_type ?? '') === String(right.property_type ?? '')
    && JSON.stringify([...(left.amenities || [])].sort()) === JSON.stringify([...(right.amenities || [])].sort());
};

export default function BuyerProfileSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [activeMode, setActiveMode] = useState('general');
  const [feedback, setFeedback] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [recommendationExists, setRecommendationExists] = useState(false);
  const [recommendationSettings, setRecommendationSettings] = useState(null);
  const [recommendationForm, setRecommendationForm] = useState(initialRecommendationState);
  const [recommendationFeedback, setRecommendationFeedback] = useState(null);
  const imageInputRef = useRef(null);

  const loadUser = async () => {
    const response = await authFetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
    });

    if (!response) {
      setLoadingUser(false);
      return;
    }

    const data = await response.json().catch(() => null);

    if (response.status === 200 && data?.payload) {
      const payload = data.payload;
      setUser(payload);
      setForm({
        firstName: payload.first_name || '',
        lastName: payload.last_name || '',
        phoneNumber: payload.phone_number || '',
        imageUrl: payload.image_url || '',
      });
    } else {
      redirectToLogin();
    }

    setLoadingUser(false);
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      await loadUser();
      if (!mounted) return;
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!profileImageFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(profileImageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImageFile]);

  useEffect(() => {
    if (activeMode !== 'buyer' || !user) {
      return undefined;
    }

    let mounted = true;

    async function loadRecommendationSettings() {
      setSettingsLoading(true);
      setRecommendationFeedback(null);

      try {
        const response = await authFetch(`${API_BASE_URL}/buyer/recommended/listings/settings`, {
          method: 'GET',
        });

        if (!response) {
          return;
        }

        const data = await response.json().catch(() => null);

        if (!mounted) return;

        if (response.status === 200) {
          if (data?.status && data?.payload) {
            const payload = data.payload;
            setRecommendationExists(true);
            setRecommendationSettings(payload);
            setRecommendationForm(normalizeRecommendationForm(payload));
          } else {
            setRecommendationExists(false);
            setRecommendationSettings(null);
            setRecommendationForm(initialRecommendationState);
          }
        } else {
          setRecommendationFeedback({ type: 'error', text: data?.message || 'Unable to load recommendation settings.' });
        }
      } catch (error) {
        console.error('Buyer recommendation settings load failed:', error);
        if (mounted) {
          setRecommendationFeedback({ type: 'error', text: 'Unable to load recommendation settings.' });
        }
      } finally {
        if (mounted) {
          setSettingsLoading(false);
        }
      }
    }

    loadRecommendationSettings();

    return () => {
      mounted = false;
    };
  }, [activeMode, user]);

  const selectedStateLgas = useMemo(() => {
    if (!recommendationForm.state) return [];
    return statesWithLgas[recommendationForm.state] || [];
  }, [recommendationForm.state]);

  const loadedRecommendationForm = useMemo(() => normalizeRecommendationForm(recommendationSettings), [recommendationSettings]);

  const recommendationIsDirty = useMemo(() => {
    if (!recommendationExists) return false;
    return !recommendationFormsEqual(recommendationForm, loadedRecommendationForm);
  }, [loadedRecommendationForm, recommendationExists, recommendationForm]);

  const recommendationIsComplete = useMemo(() => {
    return Boolean(
      recommendationForm.state.trim()
      && recommendationForm.LGA.trim()
      && recommendationForm.max_price !== ''
      && recommendationForm.min_price !== ''
      && recommendationForm.max_size !== ''
      && recommendationForm.min_size !== ''
      && recommendationForm.amenities.length > 0
      && recommendationForm.property_type.trim(),
    );
  }, [recommendationForm]);

  const recommendationSubmitLabel = recommendationExists
    ? 'Update recommendation settings'
    : 'Create recommendation settings';

  const recommendationSubmitDisabled = settingsSaving
    || settingsLoading
    || (recommendationExists ? !recommendationIsDirty : !recommendationIsComplete);

  const displayName = useMemo(() => {
    if (!user) return 'Buyer';

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    if (fullName) return fullName;
    if (user.email) return user.email.split('@')[0];
    return 'Buyer';
  }, [user]);

  const imageSource = previewUrl || form.imageUrl;

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && file.size >= MAX_PROFILE_IMAGE_BYTES) {
      setFeedback({ type: 'error', text: 'Profile image must be smaller than 1 MB.' });
      setProfileImageFile(null);
      // clear input so the same file can be reselected after user fixes it
      event.target.value = '';
      return;
    }

    setFeedback(null);
    setProfileImageFile(file);
  };

  const openImagePicker = () => {
    imageInputRef.current?.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload = new FormData();
      payload.append('first_name', form.firstName || '');
      payload.append('last_name', form.lastName || '');
      payload.append('phone_number', form.phoneNumber || '');

      if (profileImageFile) {
        payload.append('profile_image', profileImageFile);
      }

      const response = await authFetch(`${API_BASE_URL}/user/me/update`, {
        method: 'PUT',
        body: payload,
      });

      if (!response) {
        setFeedback({ type: 'error', text: 'Unable to update profile. Please try again.' });
        return;
      }

      const data = await response.json().catch(() => null);

      if (response.status === 200 && data?.status) {
        setFeedback({ type: 'success', text: data.message || 'Profile updated successfully.' });
        setProfileImageFile(null);
        await loadUser();
      } else {
        setFeedback({ type: 'error', text: data?.message || 'Unable to update profile. Please try again.' });
      }
    } catch (error) {
      console.error('Buyer profile update failed:', error);
      setFeedback({ type: 'error', text: 'Unable to update profile. Please try again.' });
    }

    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your account permanently? This action cannot be undone.');
    if (!confirmed) return;

    setDeleting(true);
    setFeedback(null);

    try {
      const response = await authFetch(`${API_BASE_URL}/user/me/delete`, {
        method: 'DELETE',
      });

      const data = await response?.json().catch(() => null);

      if (response?.status === 200 && data?.status) {
        router.replace('/signup');
      } else {
        setFeedback({ type: 'error', text: data?.message || 'Unable to delete account. Please try again.' });
      }
    } catch (error) {
      console.error('Buyer account delete failed:', error);
      setFeedback({ type: 'error', text: 'Unable to delete account. Please try again.' });
    }

    setDeleting(false);
  };

  const handleSellerAction = async () => {
    if (!user || switchingRole) return;

    if ((user.role || '').toLowerCase() === 'both') {
      router.push('/seller');
      return;
    }

    setSwitchingRole(true);
    setFeedback(null);

    try {
      const response = await authFetch(`${API_BASE_URL}/user/switch-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'seller' }),
      });

      const data = await response?.json().catch(() => null);
      if (response?.status === 200 && data?.status) {
        router.push('/seller');
      } else {
        setFeedback({ type: 'error', text: data?.message || 'Unable to open seller account. Please try again.' });
      }
    } catch (error) {
      console.error('Buyer seller switch failed:', error);
      setFeedback({ type: 'error', text: 'Unable to open seller account. Please try again.' });
    }

    setSwitchingRole(false);
  };

  const handleRecommendationFieldChange = (field) => (event) => {
    const value = event.target.value;
    setRecommendationForm((current) => {
      if (field === 'state') {
        return { ...current, state: value, LGA: '' };
      }

      return { ...current, [field]: value };
    });
  };

  const handleAmenityToggle = (amenity) => (event) => {
    const checked = event.target.checked;

    setRecommendationForm((current) => {
      const currentAmenities = Array.isArray(current.amenities) ? current.amenities : [];

      if (checked) {
        if (currentAmenities.includes(amenity)) {
          return current;
        }

        return { ...current, amenities: [...currentAmenities, amenity] };
      }

      return {
        ...current,
        amenities: currentAmenities.filter((item) => item !== amenity),
      };
    });
  };

  const handleRecommendationSubmit = async (event) => {
    event.preventDefault();
    setSettingsSaving(true);
    setRecommendationFeedback(null);

    const payload = recommendationExists
      ? Object.entries({
          state: recommendationForm.state.trim(),
          LGA: recommendationForm.LGA.trim(),
          max_price: toNullableNumber(recommendationForm.max_price),
          min_price: toNullableNumber(recommendationForm.min_price),
          max_size: toNullableNumber(recommendationForm.max_size),
          min_size: toNullableNumber(recommendationForm.min_size),
          amenities: recommendationForm.amenities,
          property_type: recommendationForm.property_type.trim(),
        }).reduce((changedValues, [key, value]) => {
          const previousValue = loadedRecommendationForm[key];
          const normalizedPrevious = key === 'amenities'
            ? JSON.stringify([...(Array.isArray(previousValue) ? previousValue : [])].sort())
            : String(previousValue ?? '');
          const normalizedCurrent = key === 'amenities'
            ? JSON.stringify([...(Array.isArray(value) ? value : [])].sort())
            : String(value ?? '');

          if (normalizedCurrent !== normalizedPrevious) {
            changedValues[key] = value;
          }

          return changedValues;
        }, {})
      : {
          state: recommendationForm.state.trim(),
          LGA: recommendationForm.LGA.trim(),
          max_price: Number(recommendationForm.max_price),
          min_price: Number(recommendationForm.min_price),
          max_size: Number(recommendationForm.max_size),
          min_size: Number(recommendationForm.min_size),
          amenities: recommendationForm.amenities,
          property_type: recommendationForm.property_type.trim(),
        };

    try {
      const response = await authFetch(`${API_BASE_URL}/buyer/recommended/listings/settings`, {
        method: recommendationExists ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response) {
        return;
      }

      const data = await response.json().catch(() => null);

      if (response.status === 200 && data?.status) {
        setRecommendationExists(true);
        setRecommendationSettings(data.payload || payload);
        setRecommendationForm(normalizeRecommendationForm(data.payload || payload));
        setRecommendationFeedback({ type: 'success', text: data.message || 'Recommendation settings saved successfully.' });
      } else {
        setRecommendationFeedback({ type: 'error', text: data?.message || 'Unable to save recommendation settings.' });
      }
    } catch (error) {
      console.error('Buyer recommendation settings save failed:', error);
      setRecommendationFeedback({ type: 'error', text: 'Unable to save recommendation settings.' });
    }

    setSettingsSaving(false);
  };

  if (loadingUser) {
    return (
      <main className="settings-page-shell buyer-profile-shell">
        <div className="settings-loading">Loading profile settings...</div>
      </main>
    );
  }

  return (
    <BuyerProfileLayout
      title="Manage your buyer profile"
      lead="Update your general account information, manage buyer preferences, and move between buyer and seller tools."
    >
      <div className="buyer-profile-content">
        <div className="buyer-profile-mode-tabs" role="tablist" aria-label="Profile settings modes">
          <button
            type="button"
            className={`buyer-profile-mode-tab ${activeMode === 'general' ? 'buyer-profile-mode-tab--active' : ''}`}
            onClick={() => setActiveMode('general')}
            role="tab"
            aria-selected={activeMode === 'general'}
          >
            General information
          </button>
          <button
            type="button"
            className={`buyer-profile-mode-tab ${activeMode === 'buyer' ? 'buyer-profile-mode-tab--active' : ''}`}
            onClick={() => setActiveMode('buyer')}
            role="tab"
            aria-selected={activeMode === 'buyer'}
          >
            Buyer information
          </button>
        </div>

        {activeMode === 'general' ? (
          <div role="tabpanel">
            <section className="settings-card buyer-summary-card">
              <div className="buyer-summary-grid">
                <button type="button" className="buyer-avatar-trigger" onClick={openImagePicker} aria-label="Change profile image">
                  <UserAvatar src={imageSource} name={displayName} size="lg" className="buyer-summary-avatar" />
                  <span className="buyer-avatar-trigger-text">Click to update</span>
                  <input
                    ref={imageInputRef}
                    className="buyer-hidden-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </button>
                <div className="buyer-summary-copy">
                  <p className="settings-kicker">Current account</p>
                  <h2>{displayName}</h2>
                  <p>{user?.email || 'Verified buyer'}</p>
                  <p className="buyer-profile-note">Keep your profile details current so viewing updates and support can reach you quickly.</p>
                </div>
                <div className="profile-link-grid">
                  <Link className="profile-link-card" href="/buyer/profile/email">
                    <strong>Update Email</strong>
                    <span>Use a separate secure page to confirm your old and new email addresses.</span>
                  </Link>
                  <Link className="profile-link-card" href="/buyer/profile/password">
                    <strong>Update Password</strong>
                    <span>Change your password on its own page with your old password and a new one.</span>
                  </Link>
                </div>
              </div>
            </section>

            <form className="settings-form buyer-settings-form" onSubmit={handleSubmit}>
              <section className="settings-card">
                <div className="settings-section-title">
                  <h2>General Information</h2>
                  <span>Your name and contact details are used across buyer account tools</span>
                </div>
                <div className="settings-grid settings-grid--two">
                  <label>
                    First Name
                    <input
                      className="form-input"
                      type="text"
                      value={form.firstName}
                      onChange={handleFieldChange('firstName')}
                      placeholder="Enter your first name"
                    />
                  </label>
                  <label>
                    Last Name
                    <input
                      className="form-input"
                      type="text"
                      value={form.lastName}
                      onChange={handleFieldChange('lastName')}
                      placeholder="Enter your last name"
                    />
                  </label>
                  <label>
                    Phone Number
                    <input
                      className="form-input"
                      type="tel"
                      value={form.phoneNumber}
                      onChange={handleFieldChange('phoneNumber')}
                      placeholder="Enter your phone number"
                    />
                  </label>
                  <label>
                    Email Address
                    <input className="form-input" value={user?.email || ''} disabled />
                  </label>
                </div>
              </section>

              {feedback && (
                <div className={`buyer-feedback buyer-feedback--${feedback.type}`} role="status">
                  {feedback.text}
                </div>
              )}

              <div className="settings-actions">
                <Link className="settings-back-button" href="/buyer">
                  Back to dashboard
                </Link>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Saving...' : 'Save profile changes'}
                </button>
              </div>
            </form>

            <section className="settings-card buyer-danger-card">
              <div>
                <p className="settings-kicker">Account deletion</p>
                <h2>Delete user account</h2>
                <p className="buyer-profile-note">This permanently removes your user account and signs you out.</p>
              </div>
              <button type="button" className="buyer-danger-button" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete account'}
              </button>
            </section>
          </div>
        ) : (
          <div role="tabpanel">
            <section className="settings-card buyer-role-card">
              <div>
                <p className="settings-kicker">Buyer called</p>
                <h2>{(user?.role || '').toLowerCase() === 'both' ? 'Seller account is ready' : 'Become a seller'}</h2>
                <p className="buyer-profile-note">
                  {(user?.role || '').toLowerCase() === 'both'
                    ? 'Your account already has seller access. Switch to the seller dashboard to manage listings and seller tools.'
                    : 'Create seller access for this account and continue to the seller dashboard when you are ready to list properties.'}
                </p>
              </div>
              <button type="button" className="primary-button buyer-role-action" onClick={handleSellerAction} disabled={switchingRole}>
                {switchingRole
                  ? 'Opening seller account...'
                  : (user?.role || '').toLowerCase() === 'both'
                    ? 'Switch to seller account'
                    : 'Become a seller'}
              </button>
            </section>

            <section className="settings-card buyer-recommendation-card">
              <div className="settings-section-title">
                <h2>Recommended listings settings</h2>
                <span>
                  {recommendationExists ? 'Update the saved recommendation preferences' : 'Create a recommendation profile to get personalized listings'}
                </span>
              </div>

              {settingsLoading ? (
                <div className="buyer-settings-loading">Loading recommendation settings...</div>
              ) : (
                <form className="settings-form buyer-settings-form" onSubmit={handleRecommendationSubmit}>
                  <div className="settings-grid settings-grid--two">
                    <label>
                      State
                      <select
                        className="form-input"
                        value={recommendationForm.state}
                        onChange={handleRecommendationFieldChange('state')}
                      >
                        <option value="">Select state</option>
                        {nigeriaStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      LGA
                      <select
                        className="form-input"
                        value={recommendationForm.LGA}
                        onChange={handleRecommendationFieldChange('LGA')}
                        disabled={!recommendationForm.state}
                      >
                        <option value="">{recommendationForm.state ? 'Select local government area' : 'Select a state first'}</option>
                        {selectedStateLgas.map((lga) => (
                          <option key={lga} value={lga}>
                            {lga}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Minimum price
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        value={recommendationForm.min_price}
                        onChange={handleRecommendationFieldChange('min_price')}
                        placeholder="Enter minimum price"
                      />
                    </label>
                    <label>
                      Maximum price
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        value={recommendationForm.max_price}
                        onChange={handleRecommendationFieldChange('max_price')}
                        placeholder="Enter maximum price"
                      />
                    </label>
                    <label>
                      Minimum size
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        value={recommendationForm.min_size}
                        onChange={handleRecommendationFieldChange('min_size')}
                        placeholder="Enter minimum size"
                      />
                    </label>
                    <label>
                      Maximum size
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        value={recommendationForm.max_size}
                        onChange={handleRecommendationFieldChange('max_size')}
                        placeholder="Enter maximum size"
                      />
                    </label>
                    <label className="settings-grid--full">
                      Amenities
                      <div className="settings-grid settings-grid--three">
                        {amenitiesList.map((amenity) => (
                          <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <input
                              type="checkbox"
                              checked={recommendationForm.amenities.includes(amenity)}
                              onChange={handleAmenityToggle(amenity)}
                            />
                            <span>{amenity.replaceAll('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </label>
                    <label className="settings-grid--full">
                      Property type
                      <select
                        className="form-input"
                        value={recommendationForm.property_type}
                        onChange={handleRecommendationFieldChange('property_type')}
                      >
                        <option value="">Select property type</option>
                        {PROPERTY_TYPES.map((propertyType) => (
                          <option key={propertyType} value={propertyType}>
                            {propertyType}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {recommendationFeedback && (
                    <div className={`buyer-feedback buyer-feedback--${recommendationFeedback.type}`} role="status">
                      {recommendationFeedback.text}
                    </div>
                  )}

                  {recommendationSettings && recommendationExists && (
                    <p className="buyer-profile-note">
                      Current saved settings loaded from the backend are ready to update.
                    </p>
                  )}

                  <div className="settings-actions">
                    <button type="submit" className="primary-button" disabled={recommendationSubmitDisabled}>
                      {settingsSaving
                        ? 'Saving...'
                        : recommendationExists
                          ? 'Update recommendation settings'
                          : 'Create recommendation settings'}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {feedback && (
              <div className={`buyer-feedback buyer-feedback--${feedback.type}`} role="status">
                {feedback.text}
              </div>
            )}

            <div className="settings-actions">
              <Link className="settings-back-button" href="/buyer">
                Back to dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </BuyerProfileLayout>
  );
}
