// src/data/accounts.js
// Fixed mock credentials for testing. Each role has its own account.
// Passwords are plain text on purpose — this is a mock frontend.
// Emails use the .local TLD so they can never reach a real inbox.

export const accounts = [
  // ---------- STUDENTS ----------
  {
    role: "STUDENT",
    label: "Emma Johnson",
    email: "emma.j@test.local",
    password: "student123",
    user: {
      id: "s1",
      name: "Emma Johnson",
      email: "emma.j@test.local",
      phone: "555-0101",
      role: "student",
    },
  },
  {
    role: "STUDENT",
    label: "Michael Chen",
    email: "michael.c@test.local",
    password: "student123",
    user: {
      id: "s2",
      name: "Michael Chen",
      email: "michael.c@test.local",
      phone: "555-0102",
      role: "student",
    },
  },
  {
    role: "STUDENT",
    label: "Sarah Williams",
    email: "sarah.w@test.local",
    password: "student123",
    user: {
      id: "s3",
      name: "Sarah Williams",
      email: "sarah.w@test.local",
      phone: "555-0103",
      role: "student",
    },
  },
  {
    role: "STUDENT",
    label: "Daniel Mokoena",
    email: "daniel.m@test.local",
    password: "student123",
    user: {
      id: "s4",
      name: "Daniel Mokoena",
      email: "daniel.m@test.local",
      phone: "555-0104",
      role: "student",
    },
  },
  {
    role: "STUDENT",
    label: "Priya Naidoo",
    email: "priya.n@test.local",
    password: "student123",
    user: {
      id: "s5",
      name: "Priya Naidoo",
      email: "priya.n@test.local",
      phone: "555-0105",
      role: "student",
    },
  },

  // ---------- LANDLORDS ----------
  {
    role: "LANDLORD",
    label: "Campus Housing Co.",
    email: "landlord1@test.local",
    password: "landlord123",
    user: {
      id: "l1",           // matches landlordId in mock-data.js
      name: "Campus Housing Co.",
      email: "landlord1@test.local",
      phone: "555-1001",
      role: "landlord",
    },
  },
  {
    role: "LANDLORD",
    label: "Maple Properties",
    email: "landlord2@test.local",
    password: "landlord123",
    user: {
      id: "l2",
      name: "Maple Properties",
      email: "landlord2@test.local",
      phone: "555-1002",
      role: "landlord",
    },
  },

  // ---------- ADMIN ----------
  {
    role: "ADMIN",
    label: "System Admin",
    email: "admin@test.local",
    password: "admin123",
    user: {
      id: "admin",
      name: "System Admin",
      email: "admin@test.local",
      role: "admin",
    },
  },
];

// Convenience lookup
export const findAccount = (email, password, role) =>
  accounts.find(
    (a) =>
      a.email.toLowerCase() === email.trim().toLowerCase() &&
      a.password === password &&
      a.role === role
  );