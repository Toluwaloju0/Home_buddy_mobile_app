"use client";

import { useEffect, useState } from "react";
import { apartmentsAPI, userAPI } from "@/lib/api";

export default function BuyerHome() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      try {
        // Fetch current user first (cookies/credentials are included by fetchAPI)
        try {
          const userRes = await userAPI.getMe();
          if (userRes && userRes.status && mounted) {
            setUser(userRes.payload || null);
          }
        } catch (err) {
          // user may be unauthenticated; continue to load apartments
          console.debug("No user session:", err.message || err);
        }

        // Fetch apartments
        const res = await apartmentsAPI.list();
        if (res && res.status && res.payload && mounted) {
          setApartments(res.payload.apartments || []);
        }
      } catch (err) {
        console.error("Failed to load page data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header: show user info instead of login/signup on buyer dashboard */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Apartments for sale</h1>
          <p className="text-sm text-gray-500">Find apartments for sale near you.</p>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">{user.first_name || user.email}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
              <img
                src={user.image_url || "/assets/default-avatar.png"}
                alt="User avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
            </>
          ) : (
            <div className="text-sm text-gray-500">Welcome</div>
          )}
        </div>
      </div>

      {/* Top filter bar (visual from design) */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-6 gap-4 items-center">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <button className="mt-1 w-full text-left px-3 py-2 border rounded bg-gray-50">All Areas ▾</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
            <button className="mt-1 w-full text-left px-3 py-2 border rounded bg-gray-50">Any ▾</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Price</label>
            <button className="mt-1 w-full text-left px-3 py-2 border rounded bg-gray-50">No Min ▾</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Price</label>
            <button className="mt-1 w-full text-left px-3 py-2 border rounded bg-gray-50">No Max ▾</button>
          </div>
          <div className="flex items-center justify-center">
            <button className="px-3 py-2 border rounded bg-white">Filter</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input className="mt-1 w-full px-3 py-2 border rounded" placeholder="Search by Location" />
          </div>
        </div>
      </div>

      {/* Apartments grid */}
      <div>
        {loading ? (
          <p className="text-center text-gray-500">Loading apartments...</p>
        ) : apartments.length === 0 ? (
          <p className="text-center text-gray-500">No apartments found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apt) => (
              <div key={apt._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-48 bg-gray-100 w-full overflow-hidden flex items-center justify-center">
                  {apt.images && apt.images.length > 0 ? (
                    // Use simple img to avoid next/image remote config for now
                    // Images are expected to be valid URLs
                    <img src={apt.images[0]} alt={apt.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{apt.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{apt.location || ""}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-primary font-bold">₦{apt.price}</div>
                    <button className="text-sm text-white bg-primary px-3 py-1 rounded">View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
