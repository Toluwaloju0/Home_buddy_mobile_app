"use client"

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";

export default function SearchPopout({ tone = "light", children = "Search" }) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  function getBackendMessage(data, hasEmptyPayload) {
    if (hasEmptyPayload) return "No listing is found for that state or local government area.";
    if (typeof data?.payload === "string") return data.payload;
    if (typeof data?.message === "string") return data.message;
    return "No listings found for this search.";
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("keydown", onKey);
      // prevent body scroll while modal is open
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      // focus input slightly after render
      setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
    return () => {};
  }, [open]);

  function openModal(e) {
    e && e.preventDefault();
    setError("");
    setOpen(true);
  }

  function closeModal() {
    setError("");
    setOpen(false);
  }

  async function refreshSearchSession() {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh`, {
      method: "GET",
      credentials: "include",
    });

    return response.status === 200;
  }

  async function submit(e) {
    e && e.preventDefault();
    const loc = (location || "").trim();
    if (!loc) return;
    setError("");
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

      if (response.status === 200 && Array.isArray(payload) && payload.length > 0) {
        setOpen(false);
        router.push(`/search?location=${encodeURIComponent(loc)}&page=1`);
        return;
      }

      setError(getBackendMessage(data, response.status === 200 && Array.isArray(payload) && payload.length === 0));
    } catch (err) {
      setError("Unable to search listings. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <>
      <button type="button" className={`static-action static-action--${tone}`} onClick={openModal}>
        {children}
      </button>

      {open && (
        <div
          className="search-popout-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="search-popout-dialog" role="dialog" aria-modal="true">
            <button className="search-popout-close" onClick={closeModal} aria-label="Close">
              ×
            </button>

            <form onSubmit={submit} className="search-popout-form">
              <input
                ref={inputRef}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setError("");
                }}
                placeholder="Enter location (e.g. Lekki, Victoria Island)"
                className="search-popout-input"
                aria-label="Search location"
                disabled={searching}
              />
              <div className="search-popout-actions">
                <button type="submit" className="search-button" disabled={searching}>
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>
              {error && <p className="search-popout-cancel" role="alert">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
