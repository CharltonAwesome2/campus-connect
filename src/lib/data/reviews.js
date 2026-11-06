// src/lib/data/reviews.js
import { supabase } from "../supabase";
import { safeNotify } from "./_helpers";

export const reviewsRepo = {
  async getReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
      id, rating, comment, created_at, updated_at, residence_id, student_id,
      students ( id, user_id, profiles ( full_name ) )
    `,
      )
      .order("created_at", { ascending: false });
    if (error) throw error;

    return (data || []).map((r) => ({
      id: r.id,
      residenceId: r.residence_id,
      studentId: r.student_id, // ← FK, always present
      studentUserId: r.students?.user_id, // nested join may be null under RLS
      studentName: r.students?.profiles?.full_name || "Student",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async addReview({ residenceId, rating, comment }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to leave a review.");

    const { data: student, error: studentErr } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (studentErr || !student) throw new Error("No student profile found for the current user.");

    const { error } = await supabase
      .from("reviews")
      .upsert(
        { residence_id: residenceId, student_id: student.id, rating, comment: comment ?? null },
        { onConflict: "residence_id,student_id" },
      );
    if (error) throw error;
    const { data: resRow } = await supabase
      .from("residences")
      .select("name, landlords ( user_id )")
      .eq("id", residenceId)
      .maybeSingle();

    if (resRow?.landlords?.user_id) {
      await safeNotify({
        user_id: resRow.landlords.user_id,
        title: "New review received",
        body: `${resRow.name}: a student left a ${rating}-star review.`,
        link: "/landlord",
      });
    }
    return this.getReviews();
  },
};
