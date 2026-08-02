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

const initialSellerFormState = {
  aboutMe: '',
  idType: '',
  idNumber: '',
  accountName: '',
  bankName: '',
  accountNumber: '',
};

const initialSellerEditFormState = {
  aboutMe: '',
  bankName: '',
  accountNumber: '',
};

const sellerFieldLabels = {
  about_me: 'About me',
  id_type: 'ID type',
  id_number: 'ID number',
  account_name: 'Account name',
  bank_name: 'Bank name',
  account_number: 'Account number',
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

function SellerInformationSection({
  user,
  sellerProfile,
  sellerForm,
  sellerEditForm,
  hasSellerProfileChanges,
  loadingSellerProfile,
  creatingSellerProfile,
  updatingSellerProfile,
  switchingRole,
  onSwitchToBuyer,
  onSellerFieldChange,
  onSellerEditFieldChange,
  onCreateSellerProfile,
  onUpdateSellerProfile,
  feedback,
}) {
  const hasBuyerAccess = (user?.role || '').toLowerCase() === 'both';
  const readOnlySellerProfileFields = [
    ['id_type', sellerProfile?.id_type],
    ['id_number', sellerProfile?.id_number],
    ['account_name', sellerProfile?.account_name],
  ];
  const verificationStatus = String(sellerProfile?.is_verified ?? '').toLowerCase();

  return (
    <div role="tabpanel">
      <section className="settings-card seller-profile-card">
        <div className="settings-section-title">
          <div>
            <p className="settings-kicker">Seller onboarding</p>
            <h2>Seller Profile</h2>
          </div>
          <span>Your seller identity and payout details</span>
        </div>

        {loadingSellerProfile ? (
          <div className="settings-loading settings-loading--inline">Loading seller profile...</div>
        ) : sellerProfile ? (
          <>
            <form className="seller-profile-edit-form" onSubmit={onUpdateSellerProfile}>
              <div className="settings-grid settings-grid--two">
              <label className="settings-grid--full seller-profile-edit-field">
                About me
                <textarea
                  className="form-input form-textarea"
                  value={sellerEditForm.aboutMe}
                  onChange={onSellerEditFieldChange('aboutMe')}
                  placeholder="Tell buyers a little about you"
                  required
                />
              </label>
              {readOnlySellerProfileFields.map(([key, value]) => (
                <div className="seller-profile-detail" key={key}>
                  <span>{sellerFieldLabels[key]}</span>
                  <strong>{value || 'Not provided'}</strong>
                </div>
              ))}
              <label className="seller-profile-edit-field">
                Bank name
                <input
                  className="form-input"
                  type="text"
                  value={sellerEditForm.bankName}
                  onChange={onSellerEditFieldChange('bankName')}
                  placeholder="Enter bank name"
                  required
                />
              </label>
              <label className="seller-profile-edit-field">
                Account number
                <input
                  className="form-input"
                  type="text"
                  inputMode="numeric"
                  value={sellerEditForm.accountNumber}
                  onChange={onSellerEditFieldChange('accountNumber')}
                  placeholder="Enter account number"
                  required
                />
              </label>
              </div>
              {hasSellerProfileChanges && (
                <div className="settings-actions seller-profile-create-actions">
                  <button type="submit" className="primary-button" disabled={updatingSellerProfile}>
                    {updatingSellerProfile ? 'Updating seller profile...' : 'Update seller profile'}
                  </button>
                </div>
              )}
            </form>
            {verificationStatus === 'false' && (
              <div className="seller-verification-cta">
                <div>
                  <p className="settings-kicker">Seller verification</p>
                  <h3>Verify your seller role</h3>
                  <p>Upload the front and back of your identification document to unlock verified seller status.</p>
                </div>
                <Link className="primary-button" href="/seller/profile/verify">Verify seller role</Link>
              </div>
            )}
            {verificationStatus === 'pending' && (
              <div className="seller-verification-cta seller-verification-cta--pending">
                <div>
                  <p className="settings-kicker">Seller verification</p>
                  <h3>Verification is pending</h3>
                  <p>Your documents are being reviewed. We’ll update your seller status when the review is complete.</p>
                </div>
                <button type="button" className="primary-button" disabled>Review pending</button>
              </div>
            )}
          </>
        ) : (
          <form className="seller-profile-create-form" onSubmit={onCreateSellerProfile}>
            <div className="seller-profile-empty-state">
              <div className="seller-profile-empty-icon" aria-hidden="true">✓</div>
              <div>
                <h3>Create your seller profile</h3>
                <p>
                  Add your verification and payout information so your seller account is ready for listings and payments.
                </p>
              </div>
            </div>
            <div className="settings-grid settings-grid--two">
              <label className="settings-grid--full">
                About Me
                <textarea
                  className="form-input form-textarea"
                  value={sellerForm.aboutMe}
                  onChange={onSellerFieldChange('aboutMe')}
                  placeholder="Tell buyers a little about you"
                  required
                />
              </label>
              <label>
                ID Type
                <select
                  className="form-input"
                  value={sellerForm.idType}
                  onChange={onSellerFieldChange('idType')}
                  required
                >
                  <option value="">Select identification type</option>
                  <option value="nin">NIN</option>
                  <option value="voters card">Voters card</option>
                  <option value="drivers license">Drivers license</option>
                </select>
              </label>
              <label>
                ID Number
                <input
                  className="form-input"
                  type="text"
                  value={sellerForm.idNumber}
                  onChange={onSellerFieldChange('idNumber')}
                  placeholder="Enter your ID number"
                  required
                />
              </label>
              <label>
                Account Name
                <input
                  className="form-input"
                  type="text"
                  value={sellerForm.accountName}
                  onChange={onSellerFieldChange('accountName')}
                  placeholder="Enter account name"
                  required
                />
              </label>
              <label>
                Bank Name
                <input
                  className="form-input"
                  type="text"
                  value={sellerForm.bankName}
                  onChange={onSellerFieldChange('bankName')}
                  placeholder="Enter bank name"
                  required
                />
              </label>
              <label>
                Account Number
                <input
                  className="form-input"
                  type="text"
                  inputMode="numeric"
                  value={sellerForm.accountNumber}
                  onChange={onSellerFieldChange('accountNumber')}
                  placeholder="Enter account number"
                  required
                />
              </label>
            </div>
            <div className="settings-actions seller-profile-create-actions">
              <button type="submit" className="primary-button" disabled={creatingSellerProfile}>
                {creatingSellerProfile ? 'Creating seller profile...' : 'Create seller profile'}
              </button>
            </div>
          </form>
        )}
      </section>

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
  const [loadingSellerProfile, setLoadingSellerProfile] = useState(true);
  const [creatingSellerProfile, setCreatingSellerProfile] = useState(false);
  const [updatingSellerProfile, setUpdatingSellerProfile] = useState(false);
  const [activeMode, setActiveMode] = useState('general');
  const [feedback, setFeedback] = useState(null);
  const [sellerFeedback, setSellerFeedback] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const [sellerForm, setSellerForm] = useState(initialSellerFormState);
  const [sellerEditForm, setSellerEditForm] = useState(initialSellerEditFormState);
  const [sellerProfile, setSellerProfile] = useState(null);
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

  const loadSellerProfile = async () => {
    setLoadingSellerProfile(true);

    try {
      const response = await authFetch(`${API_BASE_URL}/seller/me`, {
        method: 'GET',
      });

      if (!response) {
        setSellerFeedback({ type: 'error', text: 'Unable to load seller profile. Please try again.' });
        setSellerProfile(null);
        return;
      }

      const data = await response.json().catch(() => null);

      if (response.status === 200 && data?.status) {
        const payload = data.payload || null;
        setSellerProfile(payload);
        setSellerEditForm({
          aboutMe: payload?.about_me || '',
          bankName: payload?.bank_name || '',
          accountNumber: payload?.account_number || '',
        });
        setSellerFeedback(null);
      } else if (response.status === 200 && data?.status === false) {
        setSellerProfile(null);
        setSellerEditForm(initialSellerEditFormState);
        setSellerFeedback(null);
      } else {
        setSellerProfile(null);
        setSellerEditForm(initialSellerEditFormState);
        setSellerFeedback({ type: 'error', text: data?.message || 'Unable to load seller profile. Please try again.' });
      }
    } catch (error) {
      console.error('Seller profile load failed:', error);
      setSellerProfile(null);
      setSellerEditForm(initialSellerEditFormState);
      setSellerFeedback({ type: 'error', text: 'Unable to load seller profile. Please try again.' });
    } finally {
      setLoadingSellerProfile(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function init() {
      await Promise.all([loadUser(), loadSellerProfile()]);
      if (!mounted) return;
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('section') === 'seller') {
      setActiveMode('seller');
    }
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

  const sellerProfileChanges = useMemo(() => {
    if (!sellerProfile) return {};

    const changes = {};
    const currentAboutMe = sellerProfile.about_me || '';
    const currentBankName = sellerProfile.bank_name || '';
    const currentAccountNumber = sellerProfile.account_number || '';
    const nextAboutMe = sellerEditForm.aboutMe.trim();
    const nextBankName = sellerEditForm.bankName.trim();
    const nextAccountNumber = sellerEditForm.accountNumber.trim();

    if (nextAboutMe !== currentAboutMe) changes.about_me = nextAboutMe;
    if (nextBankName !== currentBankName) changes.bank_name = nextBankName;
    if (nextAccountNumber !== currentAccountNumber) changes.account_number = nextAccountNumber;

    return changes;
  }, [sellerEditForm, sellerProfile]);

  const hasSellerProfileChanges = Object.keys(sellerProfileChanges).length > 0;

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSellerFieldChange = (field) => (event) => {
    const value = event.target.value;
    setSellerForm((current) => ({ ...current, [field]: value }));
  };

  const handleSellerEditFieldChange = (field) => (event) => {
    const value = event.target.value;
    setSellerEditForm((current) => ({ ...current, [field]: value }));
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

  const handleCreateSellerProfile = async (event) => {
    event.preventDefault();
    setCreatingSellerProfile(true);
    setSellerFeedback(null);

    const payload = {
      about_me: sellerForm.aboutMe.trim(),
      id_type: sellerForm.idType,
      id_number: sellerForm.idNumber.trim(),
      account_name: sellerForm.accountName.trim(),
      bank_name: sellerForm.bankName.trim(),
      account_number: sellerForm.accountNumber.trim(),
    };

    if (Object.values(payload).some((value) => !value)) {
      setSellerFeedback({ type: 'error', text: 'Please provide all seller profile information.' });
      setCreatingSellerProfile(false);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/seller/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response?.json().catch(() => null);

      if (response?.status === 200 && data?.status) {
        setSellerFeedback({ type: 'success', text: data.message || 'Seller profile created successfully.' });
        setSellerForm(initialSellerFormState);
        await loadSellerProfile();
      } else {
        setSellerFeedback({ type: 'error', text: data?.message || 'Unable to create seller profile. Please try again.' });
      }
    } catch (error) {
      console.error('Seller profile create failed:', error);
      setSellerFeedback({ type: 'error', text: 'Unable to create seller profile. Please try again.' });
    }

    setCreatingSellerProfile(false);
  };

  const handleUpdateSellerProfile = async (event) => {
    event.preventDefault();
    if (!hasSellerProfileChanges || updatingSellerProfile) return;

    setUpdatingSellerProfile(true);
    setSellerFeedback(null);

    if (Object.values(sellerProfileChanges).some((value) => !value)) {
      setSellerFeedback({ type: 'error', text: 'Please provide a value for each edited seller profile field.' });
      setUpdatingSellerProfile(false);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/seller/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellerProfileChanges),
      });

      const data = await response?.json().catch(() => null);

      if (response?.status === 200 && data?.status) {
        setSellerFeedback({ type: 'success', text: data.message || 'Seller profile updated successfully.' });
        await loadSellerProfile();
      } else {
        setSellerFeedback({ type: 'error', text: data?.message || 'Unable to update seller profile. Please try again.' });
      }
    } catch (error) {
      console.error('Seller profile update failed:', error);
      setSellerFeedback({ type: 'error', text: 'Unable to update seller profile. Please try again.' });
    }

    setUpdatingSellerProfile(false);
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
            sellerProfile={sellerProfile}
            sellerForm={sellerForm}
            sellerEditForm={sellerEditForm}
            hasSellerProfileChanges={hasSellerProfileChanges}
            loadingSellerProfile={loadingSellerProfile}
            creatingSellerProfile={creatingSellerProfile}
            updatingSellerProfile={updatingSellerProfile}
            switchingRole={switchingRole}
            onSwitchToBuyer={handleBuyerAction}
            onSellerFieldChange={handleSellerFieldChange}
            onSellerEditFieldChange={handleSellerEditFieldChange}
            onCreateSellerProfile={handleCreateSellerProfile}
            onUpdateSellerProfile={handleUpdateSellerProfile}
            feedback={sellerFeedback}
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
