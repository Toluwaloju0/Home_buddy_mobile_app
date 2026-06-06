"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [location, setLocation] = useState("");
  const router = useRouter();

  function onSubmit(e) {
    e && e.preventDefault();
    const loc = (location || "").trim();
    if (!loc) return;
    // Redirect to the search results page
    router.push(`/search?location=${encodeURIComponent(loc)}&page=1`);
  }

  return (
    <div className="search-wrapper">
      <form onSubmit={onSubmit} className="search-form">
        <input
          aria-label="Search location"
          placeholder="Enter a location (e.g. Lekki, Victoria Island)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>
    </div>
  );
}
