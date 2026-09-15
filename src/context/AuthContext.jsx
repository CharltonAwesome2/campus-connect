// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { accounts } from "@data/accounts";

const AuthContext = createContext(null);
const STORAGE_KEY = "campusconnect.auth";

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = (email, password, role) => {
    if (!email || !password) {
      return { ok: false, error: "Please enter your email and password." };
    }
    const account = accounts.find(
      (a) =>
        a.email.toLowerCase() === email.trim().toLowerCase() &&
        a.password === password &&
        a.role === role
    );
    if (!account) {
      return { ok: false, error: "Invalid credentials for the selected role." };
    }
    setUser(account.user);
    return { ok: true };
  };

  const loginAs = (role) => {
    const account = accounts.find((a) => a.role === role);
    if (!account) return { ok: false, error: "No account for that role." };
    setUser(account.user);
    return { ok: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}