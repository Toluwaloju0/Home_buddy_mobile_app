"use client"

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { API_BASE_URL } from "../../lib/api";
import UserRoleHeader from "../components/UserRoleHeader";

function getExteriorImage(listing) {
  if (Array.isArray(listing.listing_media)) {
    for (const media of listing.listing_media) {
      const imageUrl = media && Object.values(media).find((value) => typeof value === "string" && value);
      if (imageUrl) return imageUrl;
    }
  }

  const exteriorImage = Array.isArray(listing.exterior_images) ? listing.exterior_images[0] : null;
  return exteriorImage?.url || "";
}

function getPrimaryImage(listing) {
  const media = Array.isArray(listing.listing_media) ? listing.listing_media : [];

  const findByKey = (key) => {
    for (const m of media) {
      if (!m) continue;
      if (typeof m[key] === 'string' && m[key]) return m[key];
      const val = Object.values(m).find((v) => typeof v === 'string' && v);
      if (val) return val;
    }
    return null;
  };

  const type = (listing.property_type || '').toLowerCase();
  if (type === 'shop') {
    return findByKey('shop_exterior') || getExteriorImage(listing) || '/placeholders/shop.svg';
  }

  if (type === 'land') {
    return findByKey('land_image') || getExteriorImage(listing) || '/placeholders/land.svg';
  }

  // apartment / flat fallback
  return findByKey('exterior_image') || getExteriorImage(listing) || '/placeholders/apartment.svg';
}

async function refreshSearchSession() {
  const response = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
    method: "GET",
    credentials: "include",
  });

  return response.status === 200;
}

async function browseListings(location, page, toBuy, signal, filters = {}) {
  const parts = [];
  if (location) parts.push(`location=${encodeURIComponent(location)}`);
  parts.push(`page=${page}`);
  const url = `${API_BASE_URL}/properties/browse?${parts.join('&')}`;
  const body = { ...filters };
  if (toBuy !== undefined) body.to_buy = toBuy;
  const requestInit = {
    method: "POST",
    credentials: "include",
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };

  let response = await fetch(url, requestInit);
  if (response.status === 205) {
    const refreshed = await refreshSearchSession();
    if (refreshed) {
      response = await fetch(url, requestInit);
    }
  }

  return response;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const location = searchParams.get("location") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10) || 1;
  const hasPageParam = searchParams.has("page");
  const toBuyParam = searchParams.get("to_buy");
  const toBuy = toBuyParam === null ? undefined : toBuyParam === 'true';
  const propertyTypeParam = searchParams.get("property_type") || '';
  const minPriceParam = searchParams.get("min_price") || '';
  const maxPriceParam = searchParams.get("max_price") || '';

  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Filter form state
  const [listingType, setListingType] = useState(
    toBuy === true ? 'buy' : toBuy === false ? 'rent' : 'any'
  );
  const [propertyType, setPropertyType] = useState(propertyTypeParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [filterLocation, setFilterLocation] = useState(location);
  const [lastFilters, setLastFilters] = useState({
    property_type: propertyTypeParam || undefined,
    min_price: minPriceParam ? Number(minPriceParam) : undefined,
    max_price: maxPriceParam ? Number(maxPriceParam) : undefined,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setFilterLocation(location);
  }, [location]);

  useEffect(() => {
    setPropertyType(propertyTypeParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setLastFilters({
      property_type: propertyTypeParam || undefined,
      min_price: minPriceParam ? Number(minPriceParam) : undefined,
      max_price: maxPriceParam ? Number(maxPriceParam) : undefined,
    });
  }, [propertyTypeParam, minPriceParam, maxPriceParam]);

  useEffect(() => {
    if (toBuy === true) {
      setListingType('buy');
    } else if (toBuy === false) {
      setListingType('rent');
    } else {
      setListingType('any');
    }
  }, [toBuy]);

  // Centralized search performer used by effect and filter form
  async function performSearch(opts = {}, signal) {
    const { toBuy: overrideToBuy, property_type, min_price, max_price, location: overrideLocation } = opts;
    const toBuyFinal = overrideToBuy === undefined ? toBuy : overrideToBuy;
    const locFinal = overrideLocation !== undefined ? overrideLocation : location;

    setLoading(true);
    setError(null);
    try {
      const response = await browseListings(locFinal, pageParam, toBuyFinal, signal, { property_type, min_price, max_price });
      const data = await response.json().catch(() => ({}));
      if (response.status === 205 || !response.ok || data.status === false) {
        setError(data.payload || data.message || "Failed to load listings");
        setListings([]);
        setMeta(null);
      } else {
        setListings(Array.isArray(data.payload) ? data.payload : (data.payload && data.payload.listings) || []);
        setMeta(Array.isArray(data.payload) ? null : (data.payload && data.payload.meta) || null);
      }
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!location && toBuy === undefined && !hasPageParam) return;
    const controller = new AbortController();
    performSearch(lastFilters, controller.signal);
    return () => controller.abort();
  }, [location, pageParam, toBuy, hasPageParam, lastFilters]);

  function gotoPage(p) {
    const queryParts = [];
    if (location) queryParts.push(`location=${encodeURIComponent(location)}`);
    queryParts.push(`page=${p}`);
    if (toBuy !== undefined) queryParts.push(`to_buy=${toBuy}`);
    if (lastFilters.property_type) queryParts.push(`property_type=${encodeURIComponent(lastFilters.property_type)}`);
    if (lastFilters.min_price) queryParts.push(`min_price=${lastFilters.min_price}`);
    if (lastFilters.max_price) queryParts.push(`max_price=${lastFilters.max_price}`);
    router.push(`/search?${queryParts.join('&')}`);
  }

  // Filter form handlers
  async function applyFilters(e) {
    e && e.preventDefault();
    const controller = new AbortController();
    const toBuyFromForm = listingType === 'buy' ? true : listingType === 'rent' ? false : undefined;
    const payload = {
      toBuy: toBuyFromForm,
      property_type: propertyType || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      location: filterLocation || undefined,
    };

    // Remember the applied filters so pagination preserves them
    setLastFilters(payload);

    const queryParts = [];
    if (filterLocation) queryParts.push(`location=${encodeURIComponent(filterLocation)}`);
    queryParts.push(`page=1`);
    if (payload.toBuy !== undefined) queryParts.push(`to_buy=${payload.toBuy}`);
    if (payload.property_type) queryParts.push(`property_type=${encodeURIComponent(payload.property_type)}`);
    if (payload.min_price) queryParts.push(`min_price=${payload.min_price}`);
    if (payload.max_price) queryParts.push(`max_price=${payload.max_price}`);
    router.push(`/search?${queryParts.join('&')}`);

    setShowMobileFilters(false);
    await performSearch(payload, controller.signal);
  }

  function resetFilters() {
    setListingType('any');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setFilterLocation('');
    setLastFilters({});
    performSearch({}, undefined);
  }

  async function handleListingAction(listingId) {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${listingId}`, { credentials: "include" });
      const data = await res.json().catch(() => null);
      // API may return a 2xx status but with { status: false } for auth errors
      if (!res.ok || (data && data.status === false)) {
        router.push("/login");
        return;
      }
      router.push(`/properties/${listingId}`);
    } catch (err) {
      router.push("/login");
    }
  }

  return (
    <main className="search-results-page">
      <UserRoleHeader />
      <div className="search-page-shell">
        <aside className="filters-sidebar" aria-label="Search filters">
          <form className="filters-form" onSubmit={applyFilters}>
            <label>
              Location
              <input type="text" value={filterLocation || ''} onChange={(e) => setFilterLocation(e.target.value)} placeholder="State or LGA" />
            </label>

            <label>
              Listing type
              <select value={listingType} onChange={(e) => setListingType(e.target.value)}>
                <option value="any">Any</option>
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
              </select>
            </label>

            <label>
              Property type
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                <option value="">Any</option>
                <option value="flat">flat</option>
                <option value="mini flat">mini flat</option>
                <option value="bunglow">bunglow</option>
                <option value="penthouse">penthouse</option>
                <option value="duplex">duplex</option>
                <option value="shop">shop</option>
                <option value="land">land</option>
              </select>
            </label>

            <label>
              Min price
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            </label>

            <label>
              Max price
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </label>

            <div className="filters-actions">
              <button type="submit" className="static-action static-action--light">Apply</button>
              <button type="button" className="static-action static-action--dark" onClick={resetFilters}>Reset</button>
            </div>
          </form>
        </aside>

        <div className="results-column">
          <div className="mobile-filters-bar">
            <button className="static-action filters-toggle" onClick={() => setShowMobileFilters(true)}>Filters</button>
          </div>

          {showMobileFilters && (
            <div className="search-popout-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowMobileFilters(false); }}>
              <div className="search-popout-dialog" role="dialog" aria-modal="true">
                <button className="search-popout-close" onClick={() => setShowMobileFilters(false)} aria-label="Close">×</button>
                <form className="filters-form" onSubmit={(e) => { applyFilters(e); }}>
                  <label>
                    Location
                    <input type="text" value={filterLocation || ''} onChange={(e) => setFilterLocation(e.target.value)} placeholder="State or LGA" />
                  </label>

                  <label>
                    Listing type
                    <select value={listingType} onChange={(e) => setListingType(e.target.value)}>
                      <option value="any">Any</option>
                      <option value="buy">Buy</option>
                      <option value="rent">Rent</option>
                    </select>
                  </label>

                  <label>
                    Property type
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                      <option value="">Any</option>
                      <option value="flat">flat</option>
                      <option value="mini flat">mini flat</option>
                      <option value="bunglow">bunglow</option>
                      <option value="penthouse">penthouse</option>
                      <option value="duplex">duplex</option>
                      <option value="shop">shop</option>
                      <option value="land">land</option>
                    </select>
                  </label>

                  <label>
                    Min price
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                  </label>

                  <label>
                    Max price
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  </label>

                  <div className="filters-actions">
                    <button type="submit" className="static-action static-action--light">Apply</button>
                    <button type="button" className="static-action static-action--dark" onClick={resetFilters}>Reset</button>
                  </div>
                </form>
              </div>
            </div>
          )}
      <div className="results-header">
        <h1>Listings</h1>
        {meta && <div className="results-meta">Page {meta.page} — {meta.total} results</div>}
      </div>

      {loading && <div className="search-loading">Loading…</div>}
      {error && <div className="search-error">{error}</div>}

      {!loading && listings && listings.length === 0 && <div className="no-results">No listings found</div>}

      <div className="results-list">
        {listings.map((l) => {
          const img = getPrimaryImage(l);
          const type = (l.property_type || '').toLowerCase();

          return (
            <article key={l._id} className="result-item property-card">
              <div className="property-image" aria-hidden>
                {img ? <img src={img} alt={l.title || 'Listing image'} /> : <div className="thumb-placeholder" />}
                <div className="badge badge--type">{type || 'property'}</div>
                <div className="badge badge--price">{typeof l.price === 'number' ? `NGN ${l.price.toLocaleString()}` : l.price}</div>
              </div>

              <div className="property-copy">
                <div className="property-title">{l.title || 'Untitled listing'}</div>
                <p className="property-description">{l.description || 'No description provided.'}</p>
              </div>

              <div className="result-actions">
                <button onClick={() => handleListingAction(l._id)}>View</button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="pagination">
        <button onClick={() => gotoPage(Math.max(1, pageParam - 1))} disabled={pageParam <= 1}>Previous</button>
        <span>Page {pageParam}</span>
        <button onClick={() => gotoPage(pageParam + 1)} disabled={listings.length < 10}>Next</button>
      </div>
        </div>
      </div>
    </main>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<main className="search-results-page"><UserRoleHeader /><div className="search-loading">Loading...</div></main>}>
      <SearchResultsContent />
    </Suspense>
  );
}
