'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SellerHeader from '../../components/SellerHeader';

import { API_BASE_URL, authFetch, redirectToLogin } from '../../../lib/api';
import UserAvatar from '../../components/UserAvatar';

const initialFormState = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  imageUrl: '',
};

const MAX_PROFILE_IMAGE_BYTES = 1024 * 1024; // 1 MB

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

function GeneralInformationSection({
  displayName,
  form,
  user,
  imageSource,
  imageInputRef,
  feedback,
  saving,
  deleting,
  onOpenImagePicker,
  onImageChange,
  onFieldChange,
  onSubmit,
  onDeleteAccount,
}) {
  return (
    <div role="tabpanel">
      <section className="settings-card buyer-summary-card">
        <div className="buyer-summary-grid">
          <button type="button" className="buyer-avatar-trigger" onClick={onOpenImagePicker} aria-label="Change profile image">
            <UserAvatar src={imageSource} name={displayName} size="lg" className="buyer-summary-avatar" />
            <span className="buyer-avatar-trigger-text">Click to update</span>
            <input
              ref={imageInputRef}
              className="buyer-hidden-file-input"
              type="file"
              accept="image/*"
              onChange={onImageChange}
            />
          </button>
          <div className="buyer-summary-copy">
            <p className="settings-kicker">Current account</p>
            <h2>{displayName}</h2>
            <p>{user?.email || 'Verified seller'}</p>
            <p className="buyer-profile-note">Keep your profile details current so buyers and support can reach you quickly.</p>
          </div>
          <div className="profile-link-grid">
            <Link className="profile-link-card" href="/seller/profile/email">
              <strong>Update Email</strong>
              <span>Use a separate secure page to confirm your old and new email addresses.</span>
            </Link>
            <Link className="profile-link-card" href="/seller/profile/password">
              <strong>Update Password</strong>
              <span>Change your password on its own page with your old password and a new one.</span>
            </Link>
          </div>
        </div>
      </section>

      <form className="settings-form buyer-settings-form" onSubmit={onSubmit}>
        <section className="settings-card">
          <div className="settings-section-title">
            <h2>General Information</h2>
            <span>Your name and contact details are used across seller account tools</span>
          </div>
          <div className="settings-grid settings-grid--two">
            <label>
              First Name
              <input
                className="form-input"
                type="text"
                value={form.firstName}
                onChange={onFieldChange('firstName')}
                placeholder="Enter your first name"
              />
            </label>
            <label>
              Last Name
              <input
                className="form-input"
                type="text"
                value={form.lastName}
                onChange={onFieldChange('lastName')}
                placeholder="Enter your last name"
              />
            </label>
            <label>
              Phone Number
              <input
                className="form-input"
                type="tel"
                value={form.phoneNumber}
                onChange={onFieldChange('phoneNumber')}
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
          <Link className="settings-back-button" href="/seller">
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
        <button type="button" className="buyer-danger-button" onClick={onDeleteAccount} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete account'}
        </button>
      </section>
    </div>
  );
}

function SellerInformationSection({ user, switchingRole, onSwitchToBuyer, feedback }) {
  const hasBuyerAccess = (user?.role || '').toLowerCase() === 'both';

  return (
    <div role="tabpanel">
      <section className="settings-card buyer-role-card">
        <div>
          <p className="settings-kicker">Buyer access</p>
          <h2>{hasBuyerAccess ? 'Buyer account is ready' : 'Switch to buyer account'}</h2>
          <p className="buyer-profile-note">
            {hasBuyerAccess
              ? 'Your account already has buyer access. Open the buyer dashboard to continue with buyer tools.'
              : 'Enable buyer access for this account and continue to the buyer dashboard when ready.'}
          </p>
        </div>
        <button type="button" className="primary-button buyer-role-action" onClick={onSwitchToBuyer} disabled={switchingRole}>
          {switchingRole
            ? 'Switching to buyer account...'
            : hasBuyerAccess
              ? 'Go to buyer dashboard'
              : 'Switch to buyer account'}
        </button>
      </section>

      {feedback && (
        <div className={`buyer-feedback buyer-feedback--${feedback.type}`} role="status">
          {feedback.text}
        </div>
      )}

      <div className="settings-actions">
        <Link className="settings-back-button" href="/seller">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default function SellerProfileSettingsPage() {
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

  const displayName = useMemo(() => {
    if (!user) return 'Seller';

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    if (fullName) return fullName;
    if (user.email) return user.email.split('@')[0];
    return 'Seller';
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
      console.error('Seller profile update failed:', error);
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
      const response = await authFetch(`${API_BASE_URL}/user/me`, {
        method: 'DELETE',
      });

      const data = await response?.json().catch(() => null);

      if (response?.status === 200 && data?.status) {
        router.replace('/signup');
      } else {
        setFeedback({ type: 'error', text: data?.message || 'Unable to delete account. Please try again.' });
      }
    } catch (error) {
      console.error('Seller account delete failed:', error);
      setFeedback({ type: 'error', text: 'Unable to delete account. Please try again.' });
    }

    setDeleting(false);
  };

  const handleBuyerAction = async () => {
    if (!user || switchingRole) return;

    if ((user.role || '').toLowerCase() === 'both') {
      router.push('/buyer');
      return;
    }

    setSwitchingRole(true);
    setFeedback(null);

    try {
      const response = await authFetch(`${API_BASE_URL}/user/switch-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'buyer' }),
      });

      const data = await response?.json().catch(() => null);
      if (response?.status === 200 && data?.status) {
        router.push('/buyer');
      } else {
        setFeedback({ type: 'error', text: data?.message || 'Unable to switch to buyer account. Please try again.' });
      }
    } catch (error) {
      console.error('Seller buyer switch failed:', error);
      setFeedback({ type: 'error', text: 'Unable to switch to buyer account. Please try again.' });
    }

    setSwitchingRole(false);
  };

  if (loadingUser) {
    return (
      <main className="settings-page-shell buyer-profile-shell">
        <div className="settings-loading">Loading profile settings...</div>
      </main>
    );
  }

  return (
    <main className="page-shell settings-page-shell buyer-profile-shell">
      <SellerHeader user={user} loadingUser={loadingUser} tagline="Seller profile center" />

      <section className="settings-hero buyer-profile-hero">
        <div>
          <p className="settings-kicker">Account management</p>
          <h1>Manage your seller profile</h1>
          <p>Update your general account information and switch between seller and buyer tools.</p>
        </div>
      </section>

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
            className={`buyer-profile-mode-tab ${activeMode === 'seller' ? 'buyer-profile-mode-tab--active' : ''}`}
            onClick={() => setActiveMode('seller')}
            role="tab"
            aria-selected={activeMode === 'seller'}
          >
            Seller information
          </button>
        </div>

        {activeMode === 'general' ? (
          <GeneralInformationSection
            displayName={displayName}
            form={form}
            user={user}
            imageSource={imageSource}
            imageInputRef={imageInputRef}
            feedback={feedback}
            saving={saving}
            deleting={deleting}
            onOpenImagePicker={openImagePicker}
            onImageChange={handleImageChange}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            onDeleteAccount={handleDeleteAccount}
          />
        ) : (
          <SellerInformationSection
            user={user}
            switchingRole={switchingRole}
            onSwitchToBuyer={handleBuyerAction}
            feedback={feedback}
          />
        )}
      </div>

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
              A trusted real estate platform for verified property discovery, seller tools, and role-based dashboards.
            </p>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <ul className="footer-column">
              {footerPrimaryLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
            <ul className="footer-column">
              {footerSecondaryLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">© 2026 Home Buddy Connect Limited. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
