// Mock data for the Student Residence Management System

export interface Residence {
  id: string;
  name: string;
  image: string;
  price: number;
  distance: number;
  availableRooms: number;
  totalRooms: number;
  amenities: string[];
  type: 'single' | 'shared' | 'apartment';
  landlordId: string;
}

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  residenceId: string;
  residenceName: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  email: string;
  phone: string;
}

export interface Analytics {
  totalRevenue: number;
  occupancyRate: number;
  pendingApplications: number;
  approvedThisMonth: number;
}

export const residences: Residence[] = [
  {
    id: 'r1',
    name: 'Campus View Residence',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
    price: 4500,
    distance: 0.5,
    availableRooms: 12,
    totalRooms: 50,
    amenities: ['WiFi', 'Study Room', 'Gym', 'Laundry'],
    type: 'single',
    landlordId: 'l1'
  },
  {
    id: 'r2',
    name: 'University Heights',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    price: 3500,
    distance: 1.2,
    availableRooms: 5,
    totalRooms: 30,
    amenities: ['WiFi', 'Parking', 'Security'],
    type: 'shared',
    landlordId: 'l1'
  },
  {
    id: 'r3',
    name: 'Maple Student Apartments',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    price: 6500,
    distance: 0.8,
    availableRooms: 8,
    totalRooms: 24,
    amenities: ['WiFi', 'Kitchen', 'Gym', 'Pool', 'Study Room'],
    type: 'apartment',
    landlordId: 'l2'
  },
  {
    id: 'r4',
    name: 'Riverside Commons',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    price: 4000,
    distance: 1.5,
    availableRooms: 0,
    totalRooms: 40,
    amenities: ['WiFi', 'Laundry', 'Common Room'],
    type: 'single',
    landlordId: 'l2'
  },
  {
    id: 'r5',
    name: 'Oak Hall',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    price: 3800,
    distance: 0.3,
    availableRooms: 15,
    totalRooms: 60,
    amenities: ['WiFi', 'Cafeteria', 'Study Room', 'Gym'],
    type: 'shared',
    landlordId: 'l1'
  },
  {
    id: 'r6',
    name: 'Pine Street Suites',
    image: 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800&q=80',
    price: 7000,
    distance: 2.0,
    availableRooms: 3,
    totalRooms: 18,
    amenities: ['WiFi', 'Kitchen', 'Balcony', 'Parking', 'Security'],
    type: 'apartment',
    landlordId: 'l3'
  }
];

export const applications: Application[] = [
  {
    id: 'a1',
    studentId: 's1',
    studentName: 'Emma Johnson',
    residenceId: 'r1',
    residenceName: 'Campus View Residence',
    status: 'approved',
    appliedDate: '2026-04-10',
    email: 'emma.j@university.edu',
    phone: '555-0101'
  },
  {
    id: 'a2',
    studentId: 's2',
    studentName: 'Michael Chen',
    residenceId: 'r2',
    residenceName: 'University Heights',
    status: 'pending',
    appliedDate: '2026-04-12',
    email: 'michael.c@university.edu',
    phone: '555-0102'
  },
  {
    id: 'a3',
    studentId: 's3',
    studentName: 'Sarah Williams',
    residenceId: 'r1',
    residenceName: 'Campus View Residence',
    status: 'pending',
    appliedDate: '2026-04-14',
    email: 'sarah.w@university.edu',
    phone: '555-0103'
  },
  {
    id: 'a4',
    studentId: 's4',
    studentName: 'David Martinez',
    residenceId: 'r3',
    residenceName: 'Maple Student Apartments',
    status: 'rejected',
    appliedDate: '2026-04-11',
    email: 'david.m@university.edu',
    phone: '555-0104'
  },
  {
    id: 'a5',
    studentId: 's5',
    studentName: 'Jessica Brown',
    residenceId: 'r5',
    residenceName: 'Oak Hall',
    status: 'approved',
    appliedDate: '2026-04-13',
    email: 'jessica.b@university.edu',
    phone: '555-0105'
  },
  {
    id: 'a6',
    studentId: 's6',
    studentName: 'James Taylor',
    residenceId: 'r1',
    residenceName: 'Campus View Residence',
    status: 'pending',
    appliedDate: '2026-04-15',
    email: 'james.t@university.edu',
    phone: '555-0106'
  }
];

export const adminStats = {
  totalResidences: 6,
  totalRooms: 222,
  occupiedRooms: 179,
  totalApplications: 45,
  pendingApplications: 12,
  approvedApplications: 28,
  rejectedApplications: 5,
  averageOccupancy: 80.6
};

export const monthlyData = [
  { month: 'Oct', applications: 32, occupancy: 75 },
  { month: 'Nov', applications: 28, occupancy: 78 },
  { month: 'Dec', applications: 15, occupancy: 72 },
  { month: 'Jan', applications: 38, occupancy: 81 },
  { month: 'Feb', applications: 42, occupancy: 85 },
  { month: 'Mar', applications: 35, occupancy: 82 },
  { month: 'Apr', applications: 45, occupancy: 81 }
];
