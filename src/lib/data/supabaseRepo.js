// src/lib/data/supabaseRepo.js
import { supabase } from "../supabase";

// ---------------------------------------------------------------------------
// Image URL resolution
// ---------------------------------------------------------------------------
// The DB stores either:
//   - A full URL ("https://images.unsplash.com/...")  → return as-is
//   - A bare filename ("image1.png")                   → prepend bucket base
// ---------------------------------------------------------------------------
const STORAGE_BUCKET = "residence-images";

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(imageUrl);

  return data.publicUrl;
}

export const supabaseRepo = {
  async getResidences() {
    const { data, error } = await supabase
      .from("residences")
      .select(
        `
        id,
        name,
        address,
        description,
        image_url,
        price,
        distance_km,
        available_rooms,
        total_rooms,
        type,
        landlord_id,
        residence_amenities (
          amenities ( name )
        )
      `,
      )
      .eq("is_active", true);

    if (error) throw error;

    return (data || []).map((r) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      description: r.description,
      image: resolveImageUrl(r.image_url),
      price: r.price,
      distanceKm: Number(r.distance_km),
      availableRooms: r.available_rooms,
      totalRooms: r.total_rooms,
      type: r.type,
      landlordId: r.landlord_id,
      amenities: (r.residence_amenities || []).map((ra) => ra.amenities?.name).filter(Boolean),
    }));
  },

  async getApplications() {
    const { data, error } = await supabase.from("applications").select(`
        id,
        status,
        applied_date,
        students (
          id,
          profiles ( full_name, email, phone )
        ),
        residences ( id, name )
      `);

    if (error) throw error;

    return (data || []).map((a) => ({
      id: a.id,
      studentId: a.students?.id,
      studentName: a.students?.profiles?.full_name,
      residenceId: a.residences?.id,
      residenceName: a.residences?.name,
      status: a.status,
      appliedDate: a.applied_date,
      email: a.students?.profiles?.email,
      phone: a.students?.profiles?.phone,
    }));
  },

  async addResidence(residence) {
    // Caller passes `landlordId` as a real UUID from the landlords table.
    const { data, error } = await supabase
      .from("residences")
      .insert({
        name: residence.name,
        address: residence.address,
        description: residence.description,
        image_url: residence.image, // store whatever form the caller passes
        price: residence.price,
        distance_km: residence.distanceKm,
        available_rooms: residence.availableRooms,
        total_rooms: residence.totalRooms,
        type: residence.type,
        landlord_id: residence.landlordId,
      })
      .select()
      .single();

    if (error) throw error;
    return this.getResidences();
  },

  async removeResidence(id) {
    const { error } = await supabase.from("residences").update({ is_active: false }).eq("id", id);

    if (error) throw error;
    return this.getResidences();
  },

  async getMonthlyData() {
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
    sevenMonthsAgo.setDate(1);

    const { data, error } = await supabase
      .from("applications")
      .select("applied_date")
      .gte("applied_date", sevenMonthsAgo.toISOString().slice(0, 10));

    if (error) throw error;

    const now = new Date();
    const buckets = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        month: d.toLocaleString("en", { month: "short" }),
        year: d.getFullYear(),
        applications: 0,
      });
    }

    (data || []).forEach((row) => {
      const d = new Date(row.applied_date);
      const key = d.toLocaleString("en", { month: "short" });
      const year = d.getFullYear();
      const bucket = buckets.find((b) => b.month === key && b.year === year);
      if (bucket) bucket.applications += 1;
    });

    return buckets.map(({ month, applications }) => ({ month, applications }));
  },

  async addApplication(application) {
    // Resolve the student UUID from the currently authenticated user.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to apply.");

    const { data: student, error: studentErr } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (studentErr || !student) {
      throw new Error("No student profile found for the current user.");
    }

    const { error } = await supabase.from("applications").insert({
      student_id: student.id,
      residence_id: application.residenceId,
      status: application.status || "pending",
      applied_date: application.appliedDate || new Date().toISOString().slice(0, 10),
    });

    if (error) throw error;
    return this.getApplications();
  },

  async updateApplicationStatus(id, status) {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);

    if (error) throw error;
    return this.getApplications();
  },
};
