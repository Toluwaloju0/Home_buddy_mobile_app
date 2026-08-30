"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleRendered, setGoogleRendered] = useState(false);

  useEffect(() => {
    const pre = searchParams.get('role');
    if (pre === 'seller' || pre === 'buyer') setRole(pre);
  }, [searchParams]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role,
          phone_number: phoneNumber || null,
        }),
        credentials: 'include',
      });

      const data = await response.json().catch(() => null);
      const backendMessage = data?.message || response.statusText || `Error: ${response.status}`;

      if (response.status === 200) {
        setMessage(backendMessage);
        router.push('/verify/otp');
        return;
      }

      setError(backendMessage);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (googleResponse) => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: googleResponse.credential }),
        credentials: 'include',
      });

      if (response.status === 200) {
        router.push('/buyer');
        return;
      }

      const data = await response.json().catch(() => null);
      const backendMessage = data?.message || response.statusText || 'Google sign-in failed';
      setError(backendMessage);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setError('');
    setLoading(true);
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.prompt();
      } else {
        setError('Google sign-in not available. Please try again later.');
      }
    } catch (err) {
      setError('Google sign-in failed to start.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const existing = document.getElementById('gsi-script');
    if (existing && window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCredential });
      window.google.accounts.id.renderButton(document.getElementById('g_id_signin_container'), { theme: 'outline', size: 'large', width: '100%' });
      setTimeout(() => {
        const c = document.getElementById('g_id_signin_container');
        if (c && c.childElementCount > 0) setGoogleRendered(true);
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = 'gsi-script';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCredential });
        window.google.accounts.id.renderButton(document.getElementById('g_id_signin_container'), { theme: 'outline', size: 'large', width: '100%' });
        setTimeout(() => {
          const c = document.getElementById('g_id_signin_container');
          if (c && c.childElementCount > 0) setGoogleRendered(true);
        }, 100);
      }
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <main className="login-page">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <img src="/logo.png" alt="Home Buddy Connect Limited logo" style={{ height: 56 }} />
        </div>
        <h1>Create an Account</h1>

        <form onSubmit={handleSignup} className="login-form">
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

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="form-input"
              disabled={loading}
            />

            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="form-input"
              disabled={loading}
            />

            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="role-selector">
            <label>
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={role === 'buyer'}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              />
              I am a Buyer
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="seller"
                checked={role === 'seller'}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              />
              I am a Seller
            </label>
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="primary-button"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="divider">or</div>

        <div className="social-buttons">
          <div id="g_id_signin_container" style={{ width: '100%' }} />

          {!googleRendered && (
            <button
              type="button"
              className="social-button"
              onClick={handleGoogleClick}
              disabled={loading}
              aria-label="Continue with Google"
            >
              <span className="google-icon">G</span>
              Continue with Google
            </button>
          )}

          <button type="button" className="social-button" disabled>
            <span className="apple-icon">🍎</span>
            Continue with Apple
          </button>
        </div>

        <div className="terms-text">
          By signing in you agree to Home Buddy Connect Limited{' '}
          <Link href="/terms">Terms of Use</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>
        </div>

        <div className="signup-prompt">
          Already have an account?{' '}
          <Link href="/login" className="signup-link">
            Sign in here
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="login-page"><div className="login-card">Loading...</div></main>}>
      <SignupContent />
    </Suspense>
  );
}
