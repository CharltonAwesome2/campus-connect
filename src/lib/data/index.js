// src/lib/data/index.js
import { DATA_SOURCE } from "@/config";
import { supabaseRepo } from "./supabaseRepo";

export const db = (() => {
  switch (DATA_SOURCE) {
    case "supabase":
      return supabaseRepo;
  }
})();