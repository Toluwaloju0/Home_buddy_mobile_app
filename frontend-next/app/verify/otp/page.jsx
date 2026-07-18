'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, authFetch } from '@/lib/api';

const OTP_RESEND_LIMIT = 3;
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
const OTP_RESEND_COUNT_KEY = 'otp_resend_count';
const OTP_RESEND_NEXT_ALLOWED_AT_KEY = 'otp_resend_next_allowed_at';

export default function OTPVerificationPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldownEndsAt, setCooldownEndsAt] = useState(() => Date.now() + OTP_RESEND_COOLDOWN_MS);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const storedCount = Number(window.localStorage.getItem(OTP_RESEND_COUNT_KEY) || '0');
    const storedCooldown = Number(window.localStorage.getItem(OTP_RESEND_NEXT_ALLOWED_AT_KEY) || '0');

    setResendCount(Number.isFinite(storedCount) ? storedCount : 0);
    setCooldownEndsAt(storedCooldown > Date.now() ? storedCooldown : Date.now() + OTP_RESEND_COOLDOWN_MS);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (cooldownEndsAt <= 0) return;

    window.localStorage.setItem(OTP_RESEND_NEXT_ALLOWED_AT_KEY, String(cooldownEndsAt));
  }, [cooldownEndsAt]);

  useEffect(() => {
    window.localStorage.setItem(OTP_RESEND_COUNT_KEY, String(resendCount));
  }, [resendCount]);

  const getRoleRoute = (role) => {
    if (role === 'seller' || role === 'both') {
      return '/seller';
    }

    return '/buyer';
  };

  const remainingCooldownSeconds = useMemo(() => {
    const remainingMs = Math.max(0, cooldownEndsAt - now);
    return Math.ceil(remainingMs / 1000);
  }, [cooldownEndsAt, now]);

  const canResendOtp = resendCount < OTP_RESEND_LIMIT && remainingCooldownSeconds === 0 && !resending && !loading;

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
        window.localStorage.removeItem(OTP_RESEND_COUNT_KEY);
        window.localStorage.removeItem(OTP_RESEND_NEXT_ALLOWED_AT_KEY);
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

  const handleResendOtp = async () => {
    if (!canResendOtp) return;

    setError('');
    setMessage('');
    setResending(true);

    try {
      const response = await authFetch(`${API_BASE_URL}/auth/otp/resend`, {
        method: 'GET',
      });

      if (!response) {
        setError('Unable to request a new OTP code. Please try again.');
        return;
      }

      const data = await response.json().catch(() => null);
      const backendMessage = data?.message || response.statusText || 'Request failed';

      if (response.status === 200 && data?.status === true) {
        const nextCount = resendCount + 1;
        const nextAllowedAt = Date.now() + OTP_RESEND_COOLDOWN_MS;

        setResendCount(nextCount);
        setCooldownEndsAt(nextAllowedAt);
        setMessage(backendMessage || 'A new OTP code has been sent to your email.');
      } else {
        setError(backendMessage);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1>Verify Your Account</h1>
        <p>Enter the OTP code sent to your registered email address.</p>

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

        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          <button
            type="button"
            className="primary-button"
            onClick={handleResendOtp}
            disabled={!canResendOtp}
          >
            {resending
              ? 'Requesting new code...'
              : resendCount >= OTP_RESEND_LIMIT
                ? 'OTP request limit reached'
                : remainingCooldownSeconds > 0
                  ? `Resend OTP in ${remainingCooldownSeconds}s`
                  : 'Request new OTP code'}
          </button>

          <p className="buyer-profile-note" style={{ margin: 0 }}>
            You can request up to {OTP_RESEND_LIMIT} OTP codes. Each code is valid for 10 minutes.
          </p>

          {resendCount < OTP_RESEND_LIMIT && remainingCooldownSeconds > 0 && (
            <p className="buyer-profile-note" style={{ margin: 0 }}>
              The resend button becomes available after 30 seconds.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
