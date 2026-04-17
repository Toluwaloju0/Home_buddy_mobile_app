"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { userAPI } from "@/lib/api";

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Hydrate from localStorage immediately for snappy UI
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Then refresh from server to ensure cookies/tokens are respected
    const refreshFromServer = async () => {
      try {
        const resp = await userAPI.getMe();
        if (resp && resp.status && resp.payload) {
          setUser(resp.payload);
          localStorage.setItem("user", JSON.stringify(resp.payload));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (err) {
        // Not authenticated or network error — keep stored user if any
        console.debug("User refresh failed", err.message || err);
      }
    };

    refreshFromServer();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}