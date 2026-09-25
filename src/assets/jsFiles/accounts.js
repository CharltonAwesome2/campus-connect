// src/data/accounts.js
// Quick-login shortcuts for testing. Real authentication goes through Supabase.
// The passwords here mirror the seeded auth users — they are test accounts only.

export const accounts = [
  {
    role: "student",
    label: "Emma Johnson",
    email: "emma.j@test.local",
    password: "student123",
  },
  {
    role: "landlord",
    label: "Campus Housing Co.",
    email: "campushousing@test.local",
    password: "landlord123",
  },
  {
    role: "admin",
    label: "System Admin",
    email: "admin@test.local",
    password: "admin123",
  },
];

// Kept for any legacy code that still imports it, but real validation is in Supabase.
export const findAccount = (email) =>
  accounts.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase()
  );