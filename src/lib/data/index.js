// src/lib/data/index.js
import { DATA_SOURCE } from "@/assets/jsFiles/config";
import { localStorageRepo } from "./localStorageRepo";
import { supabaseRepo } from "./supabaseRepo";

export const db = (() => {
  switch (DATA_SOURCE) {
    case "supabase":
      return supabaseRepo;
    case "localStorage":
    default:
      return localStorageRepo;
  }
})();