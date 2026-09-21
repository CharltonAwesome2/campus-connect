// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? profileFromSession(session.user) : null);
      setLoading(false);
    });

    // Keep in sync with sign-in / sign-out / token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? profileFromSession(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with email + password against Supabase Auth.
   * Returns { ok: true, user } or { ok: false, error }.
   */
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, user: profileFromSession(data.user) };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * The JWT carries the profile metadata we set during seeding.
 * Role comes from the token — the client never decides it.
 */
function profileFromSession(authUser) {
  return {
    id: authUser.id,
    email: authUser.email,
    name: authUser.user_metadata?.full_name || authUser.email,
    role: authUser.user_metadata?.role || "student",
  };
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};