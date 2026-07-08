'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL, authFetch, redirectToLogin } from '../../../../lib/api';
import SellerHeader from '../../../components/SellerHeader';

const listingTypeCards = [
  {
    key: 'shop',
    title: 'Shop',
    description: 'List a commercial shop with location, media, and ownership documents.',
    href: '/seller/listings/new/shop',
  },
  {
    key: 'land',
    title: 'Land',
    description: 'List plots, estates, and undeveloped land for sale.',
    href: '/seller/listings/new/land',
  },
  {
    key: 'apartment',
    title: 'Apartment',
    description: 'List flats, houses, short-let units, and residential apartments.',
    href: '/seller/listings/new/apartment',
  },
];

export default function NewListingPage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const response = await authFetch(`${API_BASE_URL}/user/me`, {
        method: 'GET',
      });

      if (!response) {
        if (mounted) setLoadingUser(false);
        return;
      }

      const data = await response.json().catch(() => null);
      if (!mounted) return;

      if (response.status === 200 && data?.payload) {
        setUser(data.payload);
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

  return (
    <main className="page-shell seller-page-shell">
      <SellerHeader user={user} loadingUser={loadingUser} />

      <section className="listing-type-select">
        <div className="type-select-content">
          <h1>List Your Property for Sale</h1>
          <p>Select the type of property you want to sell</p>

          <div className="type-grid">
            {listingTypeCards.map((card) => (
              <Link key={card.key} href={card.href} className="type-card">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
