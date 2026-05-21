'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const getRoleRoute = (role) => {
    if (role === 'seller' || role === 'both') {
      return '/seller';
    }

    return '/buyer';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        }
      );

      const data = await response.json().catch(() => null);
      const backendMessage = data?.message || response.statusText || 'Request failed';

      if (response.status === 200) {
        setMessage(backendMessage);
        const payload = data.payload || {};

        // Check verification status and redirect accordingly
        if (!payload.is_verified) {
          router.push('/verify/otp');
        } else {
          router.push(getRoleRoute(payload.role));
        }
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
        <div className="login-header">
          <h1>Join or Sign in</h1>
          <button
            type="button"
            className="close-button"
            onClick={() => router.back()}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
            {loading ? 'Signing in...' : 'Continue with email'}
          </button>
        </form>

        <div className="divider">or</div>

        <div className="social-buttons">
          <button type="button" className="social-button" disabled>
            <span className="google-icon">G</span>
            Continue with Google
          </button>
          <button type="button" className="social-button" disabled>
            <span className="apple-icon">🍎</span>
            Continue with Apple
          </button>
        </div>

        <div className="terms-text">
          By signing in you agree to Home Buddy{' '}
          <Link href="/terms">Terms of Use</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>
        </div>

        <div className="signup-prompt">
          New to Home Buddy?{' '}
          <Link href="/signup" className="signup-link">
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
