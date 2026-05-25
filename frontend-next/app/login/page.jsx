 'use client';

import { useState, useEffect } from 'react';
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

  const handleGoogleCredential = async (googleResponse) => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/google/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ credential: googleResponse.credential }),
          credentials: 'include',
        }
      );

      if (response.status === 200) {
        // Per spec: always redirect Google sign-ins to buyer page
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

  const [googleRendered, setGoogleRendered] = useState(false);

  const handleGoogleClick = () => {
    setError('');
    setLoading(true);
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        // Trigger the Google One Tap / prompt flow which will call our callback
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
      // small delay to let GSI render its button so we can hide our fallback
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
          {/* Google Identity Services container (GSI will insert its button here). */}
          <div id="g_id_signin_container" style={{ width: '100%' }} />

          {/* Fallback/visible Google button shown until GSI renders its own button. */}
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
          New to Home Buddy Connect Limited?{' '}
          <Link href="/signup" className="signup-link">
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
