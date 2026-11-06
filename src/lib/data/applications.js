// src/lib/data/applications.js
import { supabase } from "../supabase";
import { safeNotify } from "./_helpers";
import { residencesRepo } from "./residences";
import { paymentsRepo } from "./payments";

let _addInFlight = false;

export const applicationsRepo = {
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

  async addApplication(application) {
    if (_addInFlight) return this.getApplications();
    _addInFlight = true;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to apply.");

      const { data: student, error: studentErr } = await supabase
        .from("students").select("id").eq("user_id", user.id).single();
      if (studentErr || !student) {
        throw new Error("No student profile found for the current user.");
      }

      const { error } = await supabase.from("applications").insert({
        student_id: student.id,
        residence_id: application.residenceId,
        status: application.status || "pending",
        applied_date: application.appliedDate || new Date().toISOString().slice(0, 10),
        notes: application.notes ?? null,
        move_in_date: application.moveInDate ?? null,
      });
      if (error) throw error;

      // Best-effort notification; the landlord-side notification for approval
      // is produced atomically by landlord_approve_application.
      const { data: residenceRow } = await supabase
        .from("residences")
        .select("name, landlords ( user_id )")
        .eq("id", application.residenceId)
        .single();

      if (residenceRow?.landlords?.user_id) {
        await safeNotify({
          user_id: residenceRow.landlords.user_id,
          title: "New application received",
          body: `A student applied for ${residenceRow.name}.`,
          link: "/landlord/applications",
        });
      }

      return this.getApplications();
    } finally {
      _addInFlight = false;
    }
  },

  async updateApplicationStatus(id, status) {
    if (status === "approved") {
      // Atomic: ownership check, room decrement, invoice, both notifications.
      const { error: rpcErr } = await supabase.rpc("landlord_approve_application", {
        p_application_id: id,
      });
      if (rpcErr) throw rpcErr;
      return this.getApplications();
    }

    // Rejected path: plain update, no room change, no invoice.
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) throw error;

    // Best-effort notification to the student (server-side equivalent not
    // implemented; rejected applications don't need one for the demo).
    const { data: appRow } = await supabase
      .from("applications")
      .select("students ( user_id ), residences ( name )")
      .eq("id", id)
      .single();

    if (appRow?.students?.user_id) {
      await safeNotify({
        user_id: appRow.students.user_id,
        title: "Application rejected",
        body: `${appRow.residences?.name}: your application was rejected.`,
        link: "/student",
      });
    }

    return this.getApplications();
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
      buckets.push({ month: d.toLocaleString("en", { month: "short" }), year: d.getFullYear(), applications: 0 });
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
};