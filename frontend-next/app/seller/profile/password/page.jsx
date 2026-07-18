'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SellerHeader from '../../../components/SellerHeader';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../../lib/api';

export default function SellerProfilePasswordPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const response = await authFetch(`${API_BASE_URL}/user/me`, { method: 'GET' });

      if (!response) {
        setLoadingUser(false);
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
    if (!user) return 'Seller';
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    if (fullName) return fullName;
    if (user.email) return user.email.split('@')[0];
    return 'Seller';
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    const trimmedOldPassword = oldPassword.trim();
    const trimmedNewPassword = newPassword.trim();

    if (!trimmedOldPassword || !trimmedNewPassword) {
      setFeedback({ type: 'error', text: 'Both old and new passwords are required.' });
      setSaving(false);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/user/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: trimmedOldPassword,
          new_password: trimmedNewPassword,
        }),
      });

      if (!response) {
        setFeedback({ type: 'error', text: 'Unable to update password. Please try again.' });
        setSaving(false);
        return;
      }

      const data = await response.json().catch(() => null);

      if (response.status === 200) {
        router.push('/seller/profile');
        return;
      }

      setFeedback({ type: 'error', text: data?.message || 'Unable to update password. Please try again.' });
    } catch (error) {
      console.error('Seller password update failed:', error);
      setFeedback({ type: 'error', text: 'Unable to update password. Please try again.' });
    }

    setSaving(false);
  };

  if (loadingUser) {
    return (
      <main className="settings-page-shell buyer-profile-shell">
        <div className="settings-loading">Loading password settings...</div>
      </main>
    );
  }

  return (
    <main className="page-shell settings-page-shell buyer-profile-shell">
      <SellerHeader user={user} loadingUser={loadingUser} tagline="Seller profile center" />

      <section className="settings-hero buyer-profile-hero">
        <div>
          <p className="settings-kicker">Account management</p>
          <h1>Update your password</h1>
          <p>Provide your old and new passwords to update your seller account password.</p>
        </div>
      </section>

      <div className="buyer-profile-content">
        <section className="settings-card">
          <div className="settings-section-title">
            <h2>{displayName}</h2>
            <span>Seller account password update</span>
          </div>

          <form className="settings-form buyer-settings-form" onSubmit={handleSubmit}>
            <div className="settings-grid settings-grid--two">
              <label className="settings-grid--full">
                Old Password
                <input
                  className="form-input"
                  type="password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  placeholder="Enter your old password"
                />
              </label>
              <label className="settings-grid--full">
                New Password
                <input
                  className="form-input"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Enter your new password"
                />
              </label>
            </div>

            {feedback && (
              <div className={`buyer-feedback buyer-feedback--${feedback.type}`} role="status">
                {feedback.text}
              </div>
            )}

            <div className="settings-actions">
              <Link className="settings-back-button" href="/seller/profile">
                Back to profile settings
              </Link>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Saving...' : 'Update password'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}