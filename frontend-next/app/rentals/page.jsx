"use client"

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { API_BASE_URL } from "../../lib/api";
import RoleAwareHeader from "../components/RoleAwareHeader";
import SearchBar from "../components/SearchBar";

function RentalsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = parseInt(searchParams.get("page") || "1", 10) || 1;

  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();

    fetch(`${API_BASE_URL}/properties/rentals?page=${pageParam}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.message || "Failed to load listings");
          setListings([]);
          setMeta(null);
        } else {
          setListings((data.payload && data.payload.listings) || []);
          setMeta((data.payload && data.payload.meta) || null);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message || "Network error");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [pageParam]);

  function gotoPage(p) {
    router.push(`/rentals?page=${p}`);
  }

  async function handleListingAction(listingId) {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${listingId}`, { credentials: "include" });
      const data = await res.json().catch(() => null);
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
      <RoleAwareHeader />
      <SearchBar />

      <div className="results-header">
        <h1>Rental Listings</h1>
        {meta && <div className="results-meta">Page {meta.page} — {meta.total} results</div>}
      </div>

      {loading && <div className="search-loading">Loading…</div>}
      {error && <div className="search-error">{error}</div>}

      {!loading && listings && listings.length === 0 && <div className="no-results">No listings found</div>}

      <ul className="results-list">
        {listings.map((l) => (
          <li key={l._id} className="result-item">
            <div className="result-image" aria-hidden>
              {l.image ? <img src={l.image} alt={l.title || l.name || "listing"} /> : <div className="thumb-placeholder" />}
            </div>
            <div className="result-copy">
              <div className="result-title">{l.title || l.name}</div>
              <div className="result-location">{l.location}</div>
            </div>
            <div className="result-actions">
              <button onClick={() => handleListingAction(l._id)}>View</button>
            </div>
          </li>
        ))}
      </ul>

      {meta && (
        <div className="pagination">
          <button onClick={() => gotoPage(Math.max(1, pageParam - 1))} disabled={pageParam <= 1}>Previous</button>
          <span>Page {pageParam}</span>
          <button onClick={() => gotoPage(pageParam + 1)} disabled={meta && (pageParam * meta.per_page) >= meta.total}>Next</button>
        </div>
      )}
    </main>
  );
}

export default function RentalsPage() {
  return (
    <Suspense fallback={<main className="search-results-page"><RoleAwareHeader /><div className="search-loading">Loading...</div></main>}>
      <RentalsContent />
    </Suspense>
  );
}
