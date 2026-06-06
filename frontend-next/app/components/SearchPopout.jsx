"use client"

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchPopout({ tone = "light", children = "Search" }) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();

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
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function submit(e) {
    e && e.preventDefault();
    const loc = (location || "").trim();
    if (!loc) return;
    setOpen(false);
    router.push(`/search?location=${encodeURIComponent(loc)}&page=1`);
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
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location (e.g. Lekki, Victoria Island)"
                className="search-popout-input"
                aria-label="Search location"
              />
              <div className="search-popout-actions">
                <button type="submit" className="search-button">
                  Search
                </button>
                <button type="button" className="search-popout-cancel" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
