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
          amenities ( id, name )
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
      amenityIds: (r.residence_amenities || [])
        .map((ra) => ra.amenities?.id) // needs amenities(id, name) in the select
        .filter((x) => x != null),
    }));
  },

  async getApplications() {
    const { data, error } = await supabase.from("applications").select(`
  id, status, applied_date, notes, move_in_date,
  students ( id, user_id, profiles ( full_name, email, phone ) ),
  residences ( id, name )
`);

    if (error) throw error;

    return (data || []).map((a) => ({
      id: a.id,
      studentId: a.students?.id,
      studentUserId: a.students?.user_id,
      studentName: a.students?.profiles?.full_name,
      residenceId: a.residences?.id,
      residenceName: a.residences?.name,
      status: a.status,
      appliedDate: a.applied_date,
      notes: a.notes,
      moveInDate: a.move_in_date,
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
      notes: application.notes ?? null,
      move_in_date: application.moveInDate ?? null, // omit if you skipped the column
    });

    if (error) throw error;

    const { data: residenceRow } = await supabase
      .from("residences")
      .select("name, landlords ( user_id )")
      .eq("id", application.residenceId)
      .single();

    if (residenceRow?.landlords?.user_id) {
      await supabase.from("notifications").insert({
        user_id: residenceRow.landlords.user_id,
        title: "New application received",
        body: `A student applied for ${residenceRow.name}.`,
        link: "/landlord/applications",
      });
    }
    return this.getApplications();
  },

  async updateApplicationStatus(id, status) {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) throw error; // ← throw immediately

    const { data: appRow } = await supabase
      .from("applications")
      .select("students ( user_id ), residences ( name )")
      .eq("id", id)
      .single();

    if (appRow?.students?.user_id) {
      await supabase.from("notifications").insert({
        user_id: appRow.students.user_id,
        title: status === "approved" ? "Application approved" : "Application rejected",
        body: `${appRow.residences?.name}: your application was ${status}.`,
        link: "/student",
      });
    }
    return this.getApplications();
  },
  // -------------------------------------------------------------------------
  // Notifications
  // -------------------------------------------------------------------------
  async getNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, body, is_read, link, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data || []).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      isRead: n.is_read,
      link: n.link,
      createdAt: n.created_at,
    }));
  },

  async markNotificationRead(id) {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);

    if (error) throw error;
    return this.getNotifications();
  },

  async markAllNotificationsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) throw error;
    return this.getNotifications();
  },

  // ---------- Amenities catalog ----------
  async getAmenities() {
    const { data, error } = await supabase.from("amenities").select("id, name, icon").order("name");
    if (error) throw error;
    return data || [];
  },

  // ---------- Add ----------
  async addResidence(residence) {
    const { data, error } = await supabase
      .from("residences")
      .insert({
        name: residence.name,
        address: residence.address,
        description: residence.description,
        image_url: residence.image,
        price: residence.price,
        distance_km: residence.distanceKm,
        available_rooms: residence.availableRooms,
        total_rooms: residence.totalRooms,
        type: residence.type,
        landlord_id: residence.landlordId,
      })
      .select("id")
      .single();
    if (error) throw error;

    // Write the join rows if any amenities were picked
    if (residence.amenityIds?.length) {
      const rows = residence.amenityIds.map((amenity_id) => ({
        residence_id: data.id,
        amenity_id,
      }));
      const { error: joinErr } = await supabase.from("residence_amenities").insert(rows);
      if (joinErr) throw joinErr;
    }

    return this.getResidences();
  },

  // ---------- Update ----------
  async updateResidence(id, patch) {
    const { error } = await supabase
      .from("residences")
      .update({
        name: patch.name,
        address: patch.address,
        description: patch.description,
        price: patch.price,
        distance_km: patch.distanceKm,
        available_rooms: patch.availableRooms,
        total_rooms: patch.totalRooms,
        type: patch.type,
      })
      .eq("id", id);
    if (error) throw error;

    // Amenities: wipe + reinsert (simplest correct approach; small N)
    if (patch.amenityIds) {
      const { error: delErr } = await supabase.from("residence_amenities").delete().eq("residence_id", id);
      if (delErr) throw delErr;

      if (patch.amenityIds.length) {
        const rows = patch.amenityIds.map((amenity_id) => ({ residence_id: id, amenity_id }));
        const { error: insErr } = await supabase.from("residence_amenities").insert(rows);
        if (insErr) throw insErr;
      }
    }

    return this.getResidences();
  },
};
