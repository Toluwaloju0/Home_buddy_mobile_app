"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

export default function SearchBar() {
  const [location, setLocation] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [popoutOpen, setPopoutOpen] = useState(false);
  const router = useRouter();

  async function refreshSearchSession() {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
      method: "GET",
      credentials: "include",
    });

    return response.status === 200;
  }

  async function onSubmit(e) {
    e && e.preventDefault();
    const loc = (location || "").trim();
    if (!loc) return;

    setError("");
    setPopoutOpen(false);
    setSearching(true);

    try {
      const searchUrl = `${API_BASE_URL}/properties/browse?location=${encodeURIComponent(loc)}&page=1`;
      const requestInit = {
        method: "POST",
        credentials: "include",
      };

      let response = await fetch(searchUrl, requestInit);
      if (response.status === 205) {
        const refreshed = await refreshSearchSession();
        if (refreshed) {
          response = await fetch(searchUrl, requestInit);
        }
      }

      const data = await response.json().catch(() => ({}));
      const payload = Array.isArray(data.payload) ? data.payload : data.payload?.listings;

      if (response.status === 200) {
        const hasResults = Array.isArray(payload) && payload.length > 0;
        if (hasResults) {
          router.push(`/search?location=${encodeURIComponent(loc)}&page=1`);
          return;
        }

        setError("No listing is found for that state or local government area.");
        setPopoutOpen(true);
        return;
      }

      if (response.status === 400 || response.status === 500) {
        const backendMessage = typeof data.payload === "string" ? data.payload : data.message || "Unable to search listings.";
        setError(backendMessage);
        setPopoutOpen(true);
        return;
      }

      setError(data.message || "Unable to search listings. Please try again.");
      setPopoutOpen(true);
    } catch (err) {
      setError("Unable to search listings. Please try again.");
      setPopoutOpen(true);
    } finally {
      setSearching(false);
    }
  }

  return (
    <>
      <div className="search-wrapper">
        <form onSubmit={onSubmit} className="search-form">
          <input
            aria-label="Search location"
            placeholder="Enter a location (e.g. Lekki, Victoria Island)"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setError("");
            }}
            className="search-input"
            disabled={searching}
          />
          <button type="submit" className="search-button" disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {popoutOpen && (
        <div
          className="search-popout-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPopoutOpen(false);
          }}
        >
          <div className="search-popout-dialog" role="dialog" aria-modal="true">
            <button className="search-popout-close" onClick={() => setPopoutOpen(false)} aria-label="Close">
              ×
            </button>
            <div className="search-popout-form">
              <p className="search-popout-cancel" role="alert">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
