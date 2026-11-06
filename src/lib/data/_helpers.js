// src/lib/data/_helpers.js
import { supabase } from "../supabase";

const STORAGE_BUCKET = "residence-images";

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(imageUrl);
  return data.publicUrl;
}

// Cross-user notifications are blocked by the hardened RLS policy
// (WITH CHECK auth.uid() = user_id). The counterparty notification for the
// flow this call belongs to is produced server-side by the atomic RPCs.
// This helper makes the client-side attempt best-effort and silent.
export async function safeNotify(payload) {
  try {
    const { error } = await supabase.from("notifications").insert(payload);
    if (error) console.warn("[notifications] suppressed:", error.message);
  } catch (err) {
    console.warn("[notifications] suppressed:", err?.message);
  }
}