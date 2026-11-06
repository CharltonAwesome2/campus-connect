// src/lib/data/maintenance.js
import { supabase } from "../supabase";
import { safeNotify } from "./_helpers";

export const maintenanceRepo = {
  async getMaintenanceRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("maintenance_requests")
      .select(`
        id, title, description, status, priority, created_at, updated_at, resolved_at,
        residence_id, student_id,
        residences ( id, name, landlord_id ),
        students ( id, user_id, profiles ( full_name, email ) )
      `)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return (data || []).map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      status: m.status,
      priority: m.priority,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
      resolvedAt: m.resolved_at,
      residenceId: m.residence_id,
      residenceName: m.residences?.name,
      landlordId: m.residences?.landlord_id,
      studentId: m.student_id,
      studentUserId: m.students?.user_id,
      studentName: m.students?.profiles?.full_name,
      studentEmail: m.students?.profiles?.email,
    }));
  },

  async addMaintenanceRequest({ residenceId, title, description, priority = 3 }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in to create a request.");

    const { data: student, error: studentErr } = await supabase
      .from("students").select("id").eq("user_id", user.id).maybeSingle();
    if (studentErr || !student) throw new Error("No student profile found for the current user.");

    const { error } = await supabase.from("maintenance_requests").insert({
      student_id: student.id,
      residence_id: residenceId,
      title,
      description: description ?? null,
      priority,
      status: "open",
    });
    if (error) throw error;

    const { data: residenceRow } = await supabase
      .from("residences").select("name, landlords ( user_id )").eq("id", residenceId).single();

    if (residenceRow?.landlords?.user_id) {
      await safeNotify({
        user_id: residenceRow.landlords.user_id,
        title: "New maintenance request",
        body: `${title} - at ${residenceRow.name}.`,
        link: "/landlord",
      });
    }

    return this.getMaintenanceRequests();
  },

  async updateMaintenanceStatus(id, status) {
    const { error } = await supabase.from("maintenance_requests").update({ status }).eq("id", id);
    if (error) throw error;

    const { data: row } = await supabase
      .from("maintenance_requests")
      .select("title, status, students ( user_id ), residences ( name )")
      .eq("id", id)
      .single();

    if (row?.students?.user_id) {
      await safeNotify({
        user_id: row.students.user_id,
        title: `Maintenance ${status.replace("_", " ")}`,
        body: `${row.title} at ${row.residences?.name} is now ${status.replace("_", " ")}.`,
        link: "/student",
      });
    }

    return this.getMaintenanceRequests();
  },

  async updateMaintenancePriority(id, priority) {
    const { error } = await supabase
      .from("maintenance_requests")
      .update({ priority: parseInt(priority, 10) })
      .eq("id", id);
    if (error) throw error;
    return this.getMaintenanceRequests();
  },
};