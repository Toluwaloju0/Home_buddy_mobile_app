"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/register`,
        {
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
        }
      );

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

  const searchParams = useSearchParams();
  useEffect(() => {
    const pre = searchParams.get('role');
    if (pre === 'seller' || pre === 'buyer') setRole(pre);
  }, [searchParams]);

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
