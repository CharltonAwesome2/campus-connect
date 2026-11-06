// src/lib/data/favorites.js
import { supabase } from "../supabase";

export const favoritesRepo = {
  async getFavorites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: student } = await supabase
      .from("students").select("id").eq("user_id", user.id).maybeSingle();
    if (!student) return [];

    const { data, error } = await supabase
      .from("favorites")
      .select("residence_id, created_at")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return (data || []).map((f) => ({ residenceId: f.residence_id, createdAt: f.created_at }));
  },

  async addFavorite(residenceId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to save favorites.");

    const { data: student, error: studentErr } = await supabase
      .from("students").select("id").eq("user_id", user.id).maybeSingle();
    if (studentErr || !student) throw new Error("No student profile found for the current user.");

    const { error } = await supabase
      .from("favorites")
      .insert({ student_id: student.id, residence_id: residenceId });
    if (error && error.code !== "23505") throw error;
    return this.getFavorites();
  },

  async removeFavorite(residenceId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to edit favorites.");

    const { data: student, error: studentErr } = await supabase
      .from("students").select("id").eq("user_id", user.id).maybeSingle();
    if (studentErr || !student) throw new Error("No student profile found for the current user.");

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("student_id", student.id)
      .eq("residence_id", residenceId);
    if (error) throw error;
    return this.getFavorites();
  },
};