// src/data/accounts.js
// Fixed mock credentials for testing. Each role has its own account.
// Passwords are plain text on purpose — this is a mock frontend.

export const accounts = [
  {
    role: "student",
    label: "Emma Johnson",
    email: "emma.j@university.edu",
    password: "student123",
    user: {
      id: "s1",
      name: "Emma Johnson",
      email: "emma.j@university.edu",
      phone: "555-0101",
      role: "student",
    },
  },
  {
    role: "landlord",
    label: "Campus Housing Co.",
    email: "contact@campushousing.com",
    password: "landlord123",
    user: {
      id: "l1",           // matches landlordId in mock-data.js
      name: "Campus Housing Co.",
      email: "contact@campushousing.com",
      phone: "555-1001",
      role: "landlord",
    },
  },
  {
    role: "admin",
    label: "Admin User",
    email: "admin@campusconnect.com",
    password: "admin123",
    user: {
      id: "admin",
      name: "Admin User",
      email: "admin@campusconnect.com",
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