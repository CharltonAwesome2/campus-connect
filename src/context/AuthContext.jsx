// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        hydrateUser(session.user)
          .then(setUser)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setLoading(true);
        hydrateUser(session.user)
          .then(setUser)
          .finally(() => setLoading(false));
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, error: error.message };

    const enriched = await hydrateUser(data.user);
    return { ok: true, user: enriched };
  };

  const signup = async ({ email, password, fullName, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role, // "student" | "landlord"
        },
      },
    });

    if (error) return { ok: false, error: error.message };

    // Email confirmation ON → no session yet, user must confirm first.
    if (!data.session) {
      return { ok: true, needsConfirmation: true, user: data.user };
    }

    // Email confirmation OFF → session is live; enrich and return.
    const enriched = await hydrateUser(data.session.user);
    return { ok: true, needsConfirmation: false, user: enriched };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

async function hydrateUser(authUser) {
  const base = {
    id: authUser.id, // = profiles.id
    email: authUser.email,
    name: authUser.user_metadata?.full_name || authUser.email,
    role: authUser.user_metadata?.role || "student",
  };

  if (base.role === "landlord") {
    const { data, error } = await supabase
      .from("landlords")
      .select("id")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (error || !data) {
      console.warn(
        "[auth] landlord lookup failed for",
        authUser.email,
        error
      );
    }

    return { ...base, landlordId: data?.id ?? null };
  }

  if (base.role === "student") {
    const { data, error } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (error || !data) {
      console.warn(
        "[auth] student lookup failed for",
        authUser.email,
        error
      );
    }

    return { ...base, studentId: data?.id ?? null };
  }

  return base;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};