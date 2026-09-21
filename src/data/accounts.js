export const accounts = [
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
    role: "LANDLORD",
    label: "Campus Housing Co.",
    email: "landlord1@test.local",
    password: "landlord123",
    user: {
      id: "l1",
      name: "Campus Housing Co.",
      email: "landlord1@test.local",
      phone: "555-1001",
      role: "landlord",
    },
  },
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

export const findAccount = (email, password, role) =>
  accounts.find(
    (a) =>
      a.email.toLowerCase() === email.trim().toLowerCase() &&
      a.password === password &&
      a.role === role
  );