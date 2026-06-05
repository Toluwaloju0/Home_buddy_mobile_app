'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/admin/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        }
      );

      const data = await response.json().catch(() => null);
      const backendMessage = data?.message || response.statusText || 'Request failed';

      if (response.status === 200) {
        // redirect to admin area
        router.push('/admin');
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
        <div className="login-header">
          <h1>Admin Sign in</h1>
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

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Signing in...' : 'Sign in as admin'}
          </button>
        </form>

        <div className="signup-prompt">
          Back to <Link href="/">Home</Link>
        </div>
      </div>
    </main>
  );
}
