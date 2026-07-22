'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SellerHeader from '../../../components/SellerHeader';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../../lib/api';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

export default function SellerVerificationPage() {
  const [user, setUser] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [userResponse, sellerResponse] = await Promise.all([
        authFetch(`${API_BASE_URL}/user/me`, { method: 'GET' }),
        authFetch(`${API_BASE_URL}/seller/me`, { method: 'GET' }),
      ]);
      const userData = await userResponse?.json().catch(() => null);
      const sellerData = await sellerResponse?.json().catch(() => null);
      if (!mounted) return;

      if (userResponse?.status === 200 && userData?.payload) setUser(userData.payload);
      else {
        redirectToLogin();
        return;
      }

      if (sellerResponse?.status === 200 && sellerData?.status) {
        setSellerProfile(sellerData.payload);
      } else {
        setFeedback({ type: 'error', text: 'Create your seller profile before submitting verification documents.' });
      }
      setLoading(false);
    }

    load();
    return () => { mounted = false; };
  }, []);

  const handleFileChange = (setter) => (event) => {
    const file = event.target.files?.[0] || null;
    if (file && (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE)) {
      setFeedback({ type: 'error', text: 'Each document must be a JPG or PNG image no larger than 2 MB.' });
      event.target.value = '';
      return;
    }
    setFeedback(null);
    setter(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!frontImage || !backImage) {
      setFeedback({ type: 'error', text: 'Upload both the front and back of your ID.' });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append('id_front', frontImage);
      formData.append('id_back', backImage);
      const response = await authFetch(`${API_BASE_URL}/seller/verify`, { method: 'POST', body: formData });
      const data = await response?.json().catch(() => null);
      if (response?.status === 200 && data?.status) {
        setSellerProfile((current) => ({ ...current, is_verified: 'pending' }));
        setFeedback({ type: 'success', text: data.message || 'Documents submitted. Verification is pending review.' });
      } else setFeedback({ type: 'error', text: data?.message || 'Unable to submit verification documents.' });
    } catch (error) {
      console.error('Seller verification failed:', error);
      setFeedback({ type: 'error', text: 'Unable to submit verification documents.' });
    } finally {
      setSubmitting(false);
    }
  };

  const verificationStatus = String(sellerProfile?.is_verified ?? '').toLowerCase();
  if (loading) return <main className="settings-page-shell buyer-profile-shell"><div className="settings-loading">Loading verification...</div></main>;

  return (
    <main className="page-shell settings-page-shell buyer-profile-shell">
      <SellerHeader user={user} loadingUser={false} tagline="Seller verification center" />
      <section className="settings-hero buyer-profile-hero"><div><p className="settings-kicker">Seller verification</p><h1>Verify your seller role</h1><p>Submit clear images of your identification document for review.</p></div></section>
      <div className="buyer-profile-content">
        <section className="settings-card seller-verification-card">
          {verificationStatus === 'pending' ? <><h2>Verification pending</h2><p>Your documents are being reviewed.</p></> : verificationStatus === 'true' ? <><h2>Seller verified</h2><p>Your seller role has already been verified.</p></> : (
            <form className="seller-verification-form" onSubmit={handleSubmit}>
              <div className="seller-verification-upload-grid">
                <label className="seller-verification-file-card">ID front<input className="form-input" type="file" accept="image/jpeg,image/png" onChange={handleFileChange(setFrontImage)} required /></label>
                <label className="seller-verification-file-card">ID back<input className="form-input" type="file" accept="image/jpeg,image/png" onChange={handleFileChange(setBackImage)} required /></label>
              </div>
              {feedback && <div className={`buyer-feedback buyer-feedback--${feedback.type}`} role="status">{feedback.text}</div>}
              <div className="settings-actions"><Link className="settings-back-button" href="/seller/profile">Back to seller profile</Link><button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Submitting documents...' : 'Submit for verification'}</button></div>
            </form>
          )}
          {!feedback && verificationStatus !== 'false' && verificationStatus !== '' && <div className="settings-actions"><Link className="settings-back-button" href="/seller/profile">Back to seller profile</Link></div>}
          {feedback && verificationStatus === 'pending' && <div className="settings-actions"><Link className="settings-back-button" href="/seller/profile">Back to seller profile</Link></div>}
        </section>
      </div>
    </main>
  );
}
