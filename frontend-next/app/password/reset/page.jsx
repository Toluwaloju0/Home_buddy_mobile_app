"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

function PasswordResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) setError('Reset token not provided in the URL.');
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Reset token missing.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const url = `${API_BASE_URL}/auth/password/reset?token=${encodeURIComponent(token)}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newPassword),
      });

      const data = await response.json().catch(() => null);
      const backendMessage = data?.message || response.statusText || 'Request failed';

      if (response.status === 400) {
        setError(backendMessage);
        return;
      }

      if (response.status === 406) {
        setError(backendMessage);
        return;
      }

      if (response.status === 200) {
        setMessage(backendMessage);
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      setError(backendMessage);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <img src="/logo.png" alt="Home Buddy Connect Limited logo" style={{ height: 56 }} />
        </div>

        <h1>Set a New Password</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="form-input"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-input"
            disabled={loading}
          />

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <div style={{ marginTop: '1rem' }}>
          <Link href="/login">Back to sign in</Link>
        </div>
      </div>
    </main>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<main className="login-page"><div className="login-card">Loading...</div></main>}>
      <PasswordResetContent />
    </Suspense>
  );
}
