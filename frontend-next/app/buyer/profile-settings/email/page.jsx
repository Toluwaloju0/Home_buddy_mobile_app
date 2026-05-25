'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BuyerProfileLayout from '../BuyerProfileLayout';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../../lib/api';

export default function BuyerProfileEmailPage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [oldEmail, setOldEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');

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
        const payload = data.payload;
        setUser(payload);
        setOldEmail(payload.email || '');
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

    const trimmedOldEmail = oldEmail.trim();
    const trimmedNewEmail = newEmail.trim();

    if (!trimmedOldEmail || !trimmedNewEmail) {
      setFeedback({ type: 'error', text: 'Both the old and new email addresses are required.' });
      setSaving(false);
      return;
    }

    if (trimmedOldEmail.toLowerCase() === trimmedNewEmail.toLowerCase()) {
      setFeedback({ type: 'error', text: 'The new email address must be different from the old email address.' });
      setSaving(false);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/user/me/email`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_email: trimmedOldEmail,
          new_email: trimmedNewEmail,
        }),
      });

      if (!response) {
        setFeedback({ type: 'error', text: 'Unable to update email. Please try again.' });
        setSaving(false);
        return;
      }

      const data = await response.json().catch(() => null);

      if (response.status === 200 && data?.status) {
        setFeedback({ type: 'success', text: data.message || 'Email updated successfully. Please verify the new address.' });
        setOldEmail(trimmedNewEmail);
        setNewEmail('');
      } else {
        setFeedback({ type: 'error', text: data?.message || 'Unable to update email. Please try again.' });
      }
    } catch (error) {
      console.error('Buyer email update failed:', error);
      setFeedback({ type: 'error', text: 'Unable to update email. Please try again.' });
    }

    setSaving(false);
  };

  if (loadingUser) {
    return (
      <main className="settings-page-shell buyer-profile-shell">
        <div className="settings-loading">Loading email settings...</div>
      </main>
    );
  }

  return (
    <BuyerProfileLayout
      title="Update your email address"
      lead="Enter your current email and the new email you want to switch to. The new address must be different from the old one."
    >
      <div className="buyer-profile-content">
        <section className="settings-card">
          <div className="settings-section-title">
            <h2>{displayName}</h2>
            <span>Current account email update</span>
          </div>

          <form className="settings-form buyer-settings-form" onSubmit={handleSubmit}>
            <div className="settings-grid settings-grid--two">
              <label className="settings-grid--full">
                Old Email Address
                <input
                  className="form-input"
                  type="email"
                  value={oldEmail}
                  onChange={(event) => setOldEmail(event.target.value)}
                  placeholder="Enter your current email address"
                />
              </label>
              <label className="settings-grid--full">
                New Email Address
                <input
                  className="form-input"
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="Enter your new email address"
                />
              </label>
            </div>

            <p className="buyer-profile-note">
              A verification message will be sent to your new email address after the update is submitted.
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
                {saving ? 'Saving...' : 'Update email'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </BuyerProfileLayout>
  );
}