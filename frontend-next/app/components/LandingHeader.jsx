'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [googleRendered, setGoogleRendered] = useState(false);
  const [loading, setLoading] = useState(false);

  const navLinkClassName = useMemo(() => 'landing-nav-link', []);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((current) => !current);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleGoogleCredential = async (googleResponse) => {
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
        window.location.href = '/buyer';
        return;
      }
    } catch (err) {
      // fail silently; login page handles errors separately
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setLoading(true);
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.prompt();
      }
    } catch (err) {
      // silent fallback
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
    <header className="topbar landing-topbar">
      <div className="landing-header-main">
        <Link className="brand-lockup landing-brand-lockup" href="/" aria-label="Home Buddy Connect Limited">
          <img src="/home_buddy_logo.png" alt="Home Buddy Connect Limited" className="brand-logo" />
          <div>
            <div className="brand-name">Home Buddy Connect Limited</div>
            <div className="brand-tagline">Verified housing platform</div>
          </div>
        </Link>

        <button
          type="button"
          className="landing-mobile-toggle"
          onClick={handleMobileMenuToggle}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>

      <nav className={`landing-nav ${mobileMenuOpen ? 'landing-nav--open' : ''}`} aria-label="Primary navigation">
        <div className="landing-nav-center">
          <Link className={navLinkClassName} href="/signup?role=buyer">
            Buy
          </Link>

          <Link className={navLinkClassName} href="/signup?role=buyer">
            Rent
          </Link>

          <Link className={navLinkClassName} href="/signup?role=seller">
            Sell
          </Link>

          <Link className={navLinkClassName} href="/search">
            Search
          </Link>

          <button type="button" className="landing-nav-link landing-nav-link--disabled" disabled>
            Agents
          </button>
        </div>

        <div className="auth-action-group landing-auth-actions" aria-label="Account actions">
          <button
            type="button"
            className="join-button"
            onClick={handleGoogleClick}
            disabled={loading}
          >
            Sign in with Google
          </button>
          <Link className="join-button" href="/login">
            Login
          </Link>
          <Link className="join-button join-button--secondary" href="/signup">
            Sign up
          </Link>
        </div>

        <div className="landing-mobile-menu" aria-label="Mobile navigation links">
          <Link className="landing-nav-link landing-nav-link--mobile" href="/signup?role=buyer" onClick={handleNavClick}>
            Buy
          </Link>

          <Link className="landing-nav-link landing-nav-link--mobile" href="/signup?role=buyer" onClick={handleNavClick}>
            Rent
          </Link>

          <Link className="landing-nav-link landing-nav-link--mobile" href="/signup?role=seller" onClick={handleNavClick}>
            Sell
          </Link>

          <Link className="landing-nav-link landing-nav-link--mobile" href="/search" onClick={handleNavClick}>
            Search
          </Link>

          <button type="button" className="landing-nav-link landing-nav-link--disabled landing-nav-link--mobile" disabled>
            Agents
          </button>

          <div className="landing-mobile-auth">
            <Link className="join-button" href="/login" onClick={handleNavClick}>
              Login
            </Link>
            <button
              type="button"
              className="join-button"
              onClick={() => {
                handleGoogleClick();
                handleNavClick();
              }}
              disabled={loading}
            >
              Sign in with Google
            </button>
            <Link className="join-button join-button--secondary" href="/signup" onClick={handleNavClick}>
              Sign up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
