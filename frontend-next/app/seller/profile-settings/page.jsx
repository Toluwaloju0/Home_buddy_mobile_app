'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../lib/api';
import UserAvatar from '../../components/UserAvatar';

const initialFormState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  imageUrl: '',
  dateOfBirth: '',
  gender: '',
  residentialAddress: '',
  aboutMe: '',
  businessType: 'individual_agent',
  businessAddress: '',
  yearsOfExperience: '',
  companyName: '',
  cacRegistrationNumber: '',
  companyWebsite: '',
  nationalIdType: '',
  idNumber: '',
  accountName: '',
  bankName: '',
  accountNumber: '',
};

export default function SellerProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('seller');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState(null);
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);
  const [saveMode, setSaveMode] = useState('draft');
  const imageInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const [userResponse, sellerResponse] = await Promise.all([
        authFetch(`${API_BASE_URL}/user/me`, { method: 'GET' }),
        authFetch(`${API_BASE_URL}/seller/me`, { method: 'GET' }),
      ]);

      if (!mounted) return;

      if (!userResponse) {
        setLoading(false);
        return;
      }

      const userData = await userResponse.json().catch(() => null);
      const sellerData = sellerResponse ? await sellerResponse.json().catch(() => null) : null;

      if (userResponse.status !== 200 || !userData?.payload) {
        redirectToLogin();
        return;
      }

      const user = userData.payload;
      setUserRole((user.role || 'seller').toLowerCase());
      const sellerPayload = sellerData?.payload || {};
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();

      setForm({
        fullName,
        email: user.email || '',
        phoneNumber: user.phone_number || '',
        imageUrl: user.image_url || sellerPayload.profile_image_url || '',
        dateOfBirth: sellerPayload.date_of_birth || '',
        gender: sellerPayload.gender || '',
        residentialAddress: sellerPayload.residential_address || '',
        aboutMe: sellerPayload.about_me || '',
        businessType: sellerPayload.business_type || 'individual_agent',
        businessAddress: sellerPayload.business_address || '',
        yearsOfExperience: sellerPayload.years_of_experience || '',
        companyName: sellerPayload.company_name || '',
        cacRegistrationNumber: sellerPayload.cac_registration_number || '',
        companyWebsite: sellerPayload.company_website || '',
        nationalIdType: sellerPayload.national_id_type || '',
        idNumber: sellerPayload.id_number || '',
        accountName: sellerPayload.account_name || '',
        bankName: sellerPayload.bank_name || '',
        accountNumber: sellerPayload.account_number || '',
      });
      setLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const displayName = useMemo(() => {
    if (!form.fullName) return 'User';
    return form.fullName;
  }, [form.fullName]);

  const onFieldChange = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onImageChange = (setter) => (event) => {
    const file = event.target.files?.[0] || null;
    setter(file);
  };

  const openImagePicker = () => {
    imageInputRef.current?.click();
  };

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

  const handleSubmit = async (nextMode) => {
    setSaveMode(nextMode);
    setSaving(true);
    setFeedback(null);

    try {
      const [firstName = '', ...restNames] = form.fullName.trim().split(/\s+/);
      const lastName = restNames.join(' ');
      const payload = new FormData();

      payload.append('first_name', firstName);
      payload.append('last_name', lastName);
      payload.append('phone_number', form.phoneNumber);
      payload.append('date_of_birth', form.dateOfBirth);
      payload.append('gender', form.gender);
      payload.append('residential_address', form.residentialAddress);
      payload.append('about_me', form.aboutMe);
      payload.append('business_type', form.businessType);
      payload.append('business_address', form.businessAddress);
      payload.append('years_of_experience', form.yearsOfExperience);
      payload.append('company_name', form.companyName);
      payload.append('cac_registration_number', form.cacRegistrationNumber);
      payload.append('company_website', form.companyWebsite);
      payload.append('national_id_type', form.nationalIdType);
      payload.append('id_number', form.idNumber);
      payload.append('account_name', form.accountName);
      payload.append('bank_name', form.bankName);
      payload.append('account_number', form.accountNumber);
      payload.append('save_mode', nextMode);

      if (profileImageFile) {
        payload.append('profile_image', profileImageFile);
      }
      if (proofOfAddressFile) {
        payload.append('proof_of_address', proofOfAddressFile);
      }
      if (idFrontFile) {
        payload.append('id_front', idFrontFile);
      }
      if (idBackFile) {
        payload.append('id_back', idBackFile);
      }

      const response = await authFetch(`${API_BASE_URL}/seller/profile`, {
        method: 'PUT',
        body: payload,
      });

      if (!response) {
        setFeedback({ type: 'error', text: 'Unable to save profile settings. Please try again.' });
        setSaving(false);
        return;
      }

      const data = await response.json().catch(() => null);

      if (response?.status === 200 && data?.status) {
        setFeedback({ type: 'success', text: data.message || 'Profile updated successfully' });
        if (data.payload?.user) {
          const updatedUser = data.payload.user;
          setForm((current) => ({
            ...current,
            fullName: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim(),
            phoneNumber: updatedUser.phone_number || current.phoneNumber,
            imageUrl: updatedUser.image_url || current.imageUrl,
          }));
        }
      } else {
        setFeedback({ type: 'error', text: data?.message || 'Unable to save profile settings.' });
      }
    } catch (submissionError) {
      setFeedback({ type: 'error', text: 'Unable to save profile settings. Please try again.' });
      console.error('Seller profile update failed:', submissionError);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <main className="settings-page-shell">
        <div className="settings-loading">Loading profile settings...</div>
      </main>
    );
  }

  const handleBrandClick = () => {
    const dashboardRoutes = {
      seller: '/seller',
      buyer: '/buyer',
      agent: '/agent',
    };
    const dashboardUrl = dashboardRoutes[userRole] || '/seller';
    router.push(dashboardUrl);
  };

  return (
    <main className="page-shell settings-page-shell">
      <header className="topbar settings-topbar">
        <button
          type="button"
          className="brand-lockup brand-lockup--clickable"
          onClick={handleBrandClick}
          aria-label="Home Buddy Connect Limited dashboard"
          disabled={loading}
        >
          <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
          <div>
            <div className="brand-name">Home Buddy Connect Limited</div>
            <div className="brand-tagline">Verified housing platform</div>
          </div>
        </button>

        <div className="topbar-tags" aria-hidden="true">
          <span>Sell</span>
          <span>Agents</span>
          <span>Facility Mgt</span>
        </div>

        <div
          className="seller-user-menu"
          onMouseEnter={() => setHoverOpen(true)}
          onMouseLeave={() => setHoverOpen(false)}
          onFocus={() => setHoverOpen(true)}
          onBlur={() => setHoverOpen(false)}
        >
          <button
            type="button"
            className="profile-trigger"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen || hoverOpen}
            aria-haspopup="menu"
          >
            <UserAvatar src={form.imageUrl} name={displayName} size="sm" className="profile-avatar-shell" />
            <span className="profile-name">{displayName}</span>
            <span className="profile-caret" aria-hidden="true">▾</span>
          </button>

          <div
            className={`profile-dropdown ${dropdownOpen || hoverOpen ? 'profile-dropdown--open' : ''}`}
            role="menu"
            aria-hidden={!(dropdownOpen || hoverOpen)}
          >
            <div className="profile-dropdown-header">
              <UserAvatar src={form.imageUrl} name={displayName} size="lg" className="profile-dropdown-avatar-shell" />
              <strong>{displayName}</strong>
            </div>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller')}>Dashboard</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/messages')}>Messages</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/seller/profile-settings')}>Profile Settings</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={() => router.push('/buyer')}>Switch to Buying Account</button>
            <button type="button" className="profile-dropdown-item" role="menuitem" onClick={handleLogout}>Log out</button>
          </div>
        </div>
      </header>

      <section className="settings-hero">
        <div>
          <p className="settings-kicker">Complete Your Profile</p>
          <h1>Update your seller account and verification details</h1>
          <p>
            Keep your photo, contact details, business information, identity documents and banking details in one secure place.
          </p>
        </div>
      </section>

      <section className="settings-card seller-avatar-card">
        <div className="settings-section-title">
          <h2>Profile Image</h2>
          <span>Click the circle to upload a new image</span>
        </div>
        <div className="seller-avatar-row">
          <button type="button" className="buyer-avatar-trigger seller-avatar-trigger" onClick={openImagePicker} aria-label="Change profile image">
            <UserAvatar src={form.imageUrl} name={displayName} size="lg" className="buyer-summary-avatar seller-summary-avatar" />
            <span className="buyer-avatar-trigger-text">Click to update</span>
          </button>
          <div className="seller-avatar-copy">
            <p className="buyer-profile-note">PNG, JPG or WEBP. The selected image will be uploaded when you save your changes.</p>
          </div>
        </div>
        <input ref={imageInputRef} className="buyer-hidden-file-input" type="file" accept="image/*" onChange={onImageChange(setProfileImageFile)} />
      </section>

      <form
        className="settings-form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit('submitted');
        }}
      >
        <section className="settings-card">
          <div className="settings-section-title">
            <h2>Personal Information</h2>
            <span>Basic identity details from your user account</span>
          </div>
          <div className="settings-grid settings-grid--two">
            <label>
              Full Name
              <input className="form-input" value={form.fullName} onChange={onFieldChange('fullName')} />
            </label>
            <label>
              Email Address
              <input className="form-input" value={form.email} readOnly />
            </label>
            <label>
              Phone Number
              <input className="form-input" value={form.phoneNumber} onChange={onFieldChange('phoneNumber')} />
            </label>
            <label>
              Date of Birth
              <input className="form-input" value={form.dateOfBirth} onChange={onFieldChange('dateOfBirth')} placeholder="YYYY-MM-DD" />
            </label>
            <label>
              Gender
              <select className="form-input" value={form.gender} onChange={onFieldChange('gender')}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </label>
            <label className="settings-grid--full">
              Residential Address
              <input className="form-input" value={form.residentialAddress} onChange={onFieldChange('residentialAddress')} />
            </label>
            <label className="settings-grid--full">
              About Me
              <textarea className="form-input form-textarea" rows={4} value={form.aboutMe} onChange={onFieldChange('aboutMe')} />
            </label>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-section-title">
            <h2>Business Information</h2>
            <span>Seller and company details</span>
          </div>
          <div className="settings-radio-row">
            <label><input type="radio" checked={form.businessType === 'individual_agent'} onChange={() => setForm((current) => ({ ...current, businessType: 'individual_agent' }))} /> Individual Agent</label>
            <label><input type="radio" checked={form.businessType === 'real_estate_company'} onChange={() => setForm((current) => ({ ...current, businessType: 'real_estate_company' }))} /> Real Estate Company</label>
            <label><input type="radio" checked={form.businessType === 'landlord'} onChange={() => setForm((current) => ({ ...current, businessType: 'landlord' }))} /> Landlord</label>
          </div>
          <div className="settings-grid settings-grid--two">
            <label>
              Business Address
              <input className="form-input" value={form.businessAddress} onChange={onFieldChange('businessAddress')} />
            </label>
            <label>
              Years of Experience
              <input className="form-input" value={form.yearsOfExperience} onChange={onFieldChange('yearsOfExperience')} />
            </label>
            <label>
              Company Name
              <input className="form-input" value={form.companyName} onChange={onFieldChange('companyName')} />
            </label>
            <label>
              CAC Registration Number
              <input className="form-input" value={form.cacRegistrationNumber} onChange={onFieldChange('cacRegistrationNumber')} />
            </label>
            <label className="settings-grid--full">
              Company Website
              <input className="form-input" value={form.companyWebsite} onChange={onFieldChange('companyWebsite')} />
            </label>
          </div>
          <label className="settings-grid--full settings-file-row">
            Proof of Address
            <input type="file" accept="image/*,application/pdf" onChange={onImageChange(setProofOfAddressFile)} />
          </label>
        </section>

        <section className="settings-card">
          <div className="settings-section-title">
            <h2>Identity Verification</h2>
            <span>National ID and document uploads</span>
          </div>
          <div className="settings-grid settings-grid--two">
            <label>
              National ID Type
              <select className="form-input" value={form.nationalIdType} onChange={onFieldChange('nationalIdType')}>
                <option value="">Select ID type</option>
                <option value="nin">NIN</option>
                <option value="passport">International Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="voters_card">Voter's Card</option>
              </select>
            </label>
            <label>
              ID Number
              <input className="form-input" value={form.idNumber} onChange={onFieldChange('idNumber')} />
            </label>
            <label className="settings-file-row">
              Upload ID Front
              <input type="file" accept="image/*" onChange={onImageChange(setIdFrontFile)} />
            </label>
            <label className="settings-file-row">
              Upload ID Back
              <input type="file" accept="image/*" onChange={onImageChange(setIdBackFile)} />
            </label>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-section-title">
            <h2>Bank Information</h2>
            <span>Payment details for settlements</span>
          </div>
          <div className="settings-grid settings-grid--three">
            <label>
              Account Name
              <input className="form-input" value={form.accountName} onChange={onFieldChange('accountName')} />
            </label>
            <label>
              Bank Name
              <input className="form-input" value={form.bankName} onChange={onFieldChange('bankName')} />
            </label>
            <label>
              Account Number
              <input className="form-input" value={form.accountNumber} onChange={onFieldChange('accountNumber')} />
            </label>
          </div>
        </section>

        {feedback ? (
          <div className={feedback.type === 'success' ? 'success-message' : 'error-message'}>
            {feedback.text}
          </div>
        ) : null}

        <div className="settings-actions">
          <button type="button" className="primary-button primary-button--ghost" onClick={() => handleSubmit('draft')} disabled={saving}>
            {saving && saveMode === 'draft' ? 'Saving...' : 'Save as Draft'}
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving && saveMode === 'submitted' ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

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
    </main>
  );
}
