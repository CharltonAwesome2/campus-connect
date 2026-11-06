// src/lib/data/residences.js
import { supabase } from "../supabase";
import { resolveImageUrl } from "./_helpers";

export const residencesRepo = {
  async getResidences() {
    const { data, error } = await supabase
      .from("residences")
      .select(`
        id, name, address, description, image_url, price, distance_km,
        available_rooms, total_rooms, type, landlord_id,
        residence_amenities ( amenities ( id, name ) )
      `)
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
      amenityIds: (r.residence_amenities || []).map((ra) => ra.amenities?.id).filter((x) => x != null),
    }));
  },

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

    if (patch.amenityIds) {
      const { error: delErr } = await supabase
        .from("residence_amenities")
        .delete()
        .eq("residence_id", id);
      if (delErr) throw delErr;

      if (patch.amenityIds.length) {
        const rows = patch.amenityIds.map((amenity_id) => ({ residence_id: id, amenity_id }));
        const { error: insErr } = await supabase.from("residence_amenities").insert(rows);
        if (insErr) throw insErr;
      }
    }

    return this.getResidences();
  },

  async removeResidence(id) {
    const { error } = await supabase.from("residences").update({ is_active: false }).eq("id", id);
    if (error) throw error;
    return this.getResidences();
  },
};