// src/lib/data/index.js
import { DATA_SOURCE } from "@/config";
import { localStorageRepo } from "./localStorageRepo";
// import { supabaseRepo } from "./supabaseRepo"; // later

export const db = (() => {
  switch (DATA_SOURCE) {
    case "supabase":
      // return supabaseRepo;
      console.warn("Supabase not ready – using localStorage");
      return localStorageRepo;
    case "localStorage":
    default:
      return localStorageRepo;
  }
})();