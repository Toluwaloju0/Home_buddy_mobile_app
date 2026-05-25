'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BuyerProfileLayout from '../BuyerProfileLayout';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../../lib/api';

export default function BuyerProfilePasswordPage() {
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
    if (!user) return 'Buyer';
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    if (fullName) return fullName;
    if (user.email) return user.email.split('@')[0];
    return 'Buyer';
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    const trimmedOldPassword = oldPassword.trim();
    const trimmedNewPassword = newPassword.trim();

    if (!trimmedOldPassword || !trimmedNewPassword) {
      setFeedback({ type: 'error', text: 'Both the old and new passwords are required.' });
      setSaving(false);
      return;
    }

    if (trimmedOldPassword === trimmedNewPassword) {
      setFeedback({ type: 'error', text: 'The new password must be different from the old password.' });
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

      if (response.status === 200 && data?.status) {
        setFeedback({ type: 'success', text: data.message || 'Password updated successfully.' });
        setOldPassword('');
        setNewPassword('');
      } else {
        setFeedback({ type: 'error', text: data?.message || 'Unable to update password. Please try again.' });
      }
    } catch (error) {
      console.error('Buyer password update failed:', error);
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
    <BuyerProfileLayout
      title="Update your password"
      lead="Use your current password to unlock a new one. The old and new passwords must be different."
    >
      <div className="buyer-profile-content">
        <section className="settings-card">
          <div className="settings-section-title">
            <h2>{displayName}</h2>
            <span>Secure password update</span>
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
                  placeholder="Enter your current password"
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

            <p className="buyer-profile-note">
              Choose a password you have not used before and keep it private.
            </p>

            {feedback && (
              <div className={`buyer-feedback buyer-feedback--${feedback.type}`} role="status">
                {feedback.text}
              </div>
            )}

            <div className="settings-actions">
              <Link className="settings-back-button" href="/buyer/profile-settings">
                Back to profile settings
              </Link>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Saving...' : 'Update password'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </BuyerProfileLayout>
  );
}