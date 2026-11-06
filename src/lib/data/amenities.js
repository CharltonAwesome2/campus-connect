// src/lib/data/amenities.js
import { supabase } from "../supabase";

export const amenitiesRepo = {
  async getAmenities() {
    const { data, error } = await supabase.from("amenities").select("id, name, icon").order("name");
    if (error) throw error;
    return data || [];
  },
};