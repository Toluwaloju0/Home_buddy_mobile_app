'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import BuyerProfileLayout from './BuyerProfileLayout';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../lib/api';
import UserAvatar from '../../components/UserAvatar';

const initialFormState = {
  phoneNumber: '',
  imageUrl: '',
};

const MAX_PROFILE_IMAGE_BYTES = 1024 * 1024; // 1 MB

export default function BuyerProfileSettingsPage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
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

  if (loadingUser) {
    return (
      <main className="settings-page-shell buyer-profile-shell">
        <div className="settings-loading">Loading profile settings...</div>
      </main>
    );
  }

  return (
    <BuyerProfileLayout
      title="Update your buyer profile"
      lead="Update your profile image and phone number here. Email and password changes are handled on separate secure pages."
    >
      <div className="buyer-profile-content">
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
              <p className="buyer-profile-note">Keep your phone number current so viewing updates and support can reach you quickly.</p>
            </div>
            <div className="profile-link-grid">
              <Link className="profile-link-card" href="/buyer/profile-settings/email">
                <strong>Update Email</strong>
                <span>Use a separate secure page to confirm your old and new email addresses.</span>
              </Link>
              <Link className="profile-link-card" href="/buyer/profile-settings/password">
                <strong>Update Password</strong>
                <span>Change your password on its own page with your old password and a new one.</span>
              </Link>
            </div>
          </div>
        </section>

        <form className="settings-form buyer-settings-form" onSubmit={handleSubmit}>
          {/* file input moved into the avatar button so only the button triggers uploads */}

          <section className="settings-card">
            <div className="settings-section-title">
              <h2>Phone Number And Email Address</h2>
              <span>This number is used for account and property updates</span>
            </div>
            <div className="settings-grid settings-grid--two">
              <label className="settings-grid--full">
                Phone Number
                <input
                  className="form-input"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleFieldChange('phoneNumber')}
                  placeholder="Enter your phone number"
                />
              </label>
              <label className="settings-grid--full">
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
      </div>
    </BuyerProfileLayout>
  );
}