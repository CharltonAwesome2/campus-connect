// src/lib/data/supabaseRepo.js
import { supabase } from "../supabase";

export const supabaseRepo = {
  async getResidences() {
    const { data, error } = await supabase
      .from("residences")
      .select(`
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
      `)
      .eq("is_active", true);

    if (error) throw error;

    // Map database shape → the shape your components already expect
    return (data || []).map((r) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      description: r.description,
      image: r.image_url,
      price: r.price,
      distanceKm: Number(r.distance_km),
      availableRooms: r.available_rooms,
      totalRooms: r.total_rooms,
      type: r.type,
      landlordId: r.landlord_id,
      amenities: (r.residence_amenities || []).map((ra) => ra.amenities.name),
    }));
  },

  async getApplications() {
    const { data, error } = await supabase
      .from("applications")
      .select(`
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
    // You will need a real landlord_id UUID from your landlords table
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
        landlord_id: residence.landlordId, // must be a real UUID
      })
      .select()
      .single();

    if (error) throw error;

    // Return the full updated list so DataContext stays simple
    return this.getResidences();
  },

  async removeResidence(id) {
    const { error } = await supabase
      .from("residences")
      .update({ is_active: false }) // soft delete
      .eq("id", id);

    if (error) throw error;
    return this.getResidences();
  },

  async addApplication(application) {
    const { error } = await supabase.from("applications").insert({
      student_id: application.studentId,   // must be real UUID
      residence_id: application.residenceId, // must be real UUID
      status: application.status || "pending",
      applied_date: application.appliedDate || new Date().toISOString().slice(0, 10),
    });

    if (error) throw error;
    return this.getApplications();
  },

  async updateApplicationStatus(id, status) {
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
    return this.getApplications();
  },
};