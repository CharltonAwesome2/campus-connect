// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        hydrateUser(session.user).then(setUser).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        hydrateUser(session.user).then(setUser);
      } else {
        setUser(null);
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
 * Build the client-side user shape. Pulls the entity-specific ID
 * (landlords.id or students.id) so components can match records.
 */
async function hydrateUser(authUser) {
  const base = {
    id: authUser.id,                          // = profiles.id
    email: authUser.email,
    name: authUser.user_metadata?.full_name || authUser.email,
    role: authUser.user_metadata?.role || "student",
  };

  if (base.role === "landlord") {
    const { data } = await supabase
      .from("landlords")
      .select("id")
      .eq("user_id", authUser.id)
      .maybeSingle();
    return { ...base, landlordId: data?.id ?? null };
  }

  if (base.role === "student") {
    const { data } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", authUser.id)
      .maybeSingle();
    return { ...base, studentId: data?.id ?? null };
  }

  // admin — no extra ID needed
  return base;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};