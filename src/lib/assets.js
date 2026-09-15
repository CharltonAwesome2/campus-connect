// src/lib/assets.js
// Resolve a file in /public using Vite's base URL.
// Usage: publicUrl("campus-connect.jpg")
export function publicUrl(filename) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${filename.replace(/^\//, "")}`;
}