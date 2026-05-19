'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, authFetch } from '@/lib/api';

export default function OTPVerificationPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const getRoleRoute = (role) => {
    if (role === 'seller' || role === 'both') {
      return '/seller';
    }

    return '/buyer';
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authFetch(
        `${API_BASE_URL}/auth/otp/verify?otp_code=${encodeURIComponent(otp)}`,
        {
          method: 'POST',
        }
      );

      if (!response) {
        return;
      }

      const data = await response.json().catch(() => null);
      const backendMessage = data?.message || response.statusText || 'Request failed';

      if (response.status === 200) {
        setMessage(backendMessage);
        const payload = data.payload || {};

        // Redirect based on role after verification
        router.push(getRoleRoute(payload.role));
      } else if (response.status === 500) {
        setError(backendMessage);
      } else {
        setError(backendMessage);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Verify Your Account</h1>
        <p>Enter the OTP code sent to your registered phone number.</p>

        <form onSubmit={handleVerify} className="login-form">
          <input
            type="text"
            placeholder="Enter OTP code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength="6"
            className="form-input"
            disabled={loading}
          />

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="primary-button"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </main>
  );
}
