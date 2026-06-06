"use client";

import React, { useState } from 'react';

const forSale = [
  {
    name: 'Lekki Luxury Apartment',
    location: 'Lekki Phase 1, Lagos',
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Maitama Comfort Flat',
    location: 'Yaba, Lagos',
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Island View Apartment',
    location: 'Victoria Island, Lagos',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Epe Garden Land',
    location: 'Epe, Lagos',
    image:
      'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1600&q=80',
  },
];

const shops = [
  {
    name: "Ikeja Corner Shop",
    location: 'Ikeja, Lagos',
    image:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: "Surulere Mini Mart",
    location: 'Surulere, Lagos',
    image:
      'https://images.unsplash.com/photo-1496284045406-d3e0b918d2a0?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: "Lekki Retail Store",
    location: 'Lekki, Lagos',
    image:
      'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1600&q=80',
  },
];

const lands = [
  {
    name: 'Ikorodu Farmland',
    location: 'Ikorodu, Lagos',
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Epe Open Field',
    location: 'Epe, Lagos',
    image:
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d5?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Badagry Coastal Parcel',
    location: 'Badagry, Lagos',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  },
];

export default function FeaturedProperties() {
  const tabs = ['For Sale', 'Shops', 'Lands'];
  const [active, setActive] = useState('For Sale');

  const getItems = () => {
    switch (active) {
      case 'Shops':
        return shops;
      case 'Lands':
        return lands;
      default:
        return forSale;
    }
  };

  const items = getItems();

  return (
    <section className="featured-section">
      <div className="section-heading">
        <h2>Featured Properties</h2>
        <div className="filter-tabs" role="tablist" aria-label="Property filters">
          {tabs.map((t) => (
            <span
              key={t}
              role="tab"
              tabIndex={0}
              aria-pressed={t === active}
              className={t === active ? 'active' : ''}
              onClick={() => setActive(t)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActive(t);
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="property-strip" aria-live="polite">
        {items.map((property, idx) => (
          <article className="property-card" key={`${property.name}-${idx}`}>
            <div className="property-photo" aria-hidden="true">
              <img src={property.image} alt={property.name} className="property-photo-image" />
            </div>
            <div className="property-copy">
              <h3>{property.name}</h3>
              <p>{property.location}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
