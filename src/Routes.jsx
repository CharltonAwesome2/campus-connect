// src/Routes.jsx
import { createBrowserRouter } from "react-router";
import Login from "@/pages/login/Login";
import Signup from "@/pages/signUp/Signup";
import Home from "@/pages/home/Home";
import StudentDashboard from "@/pages/studentDashboard/StudentDashboard";
import LandlordDashboard from "@/pages/landlordDashboard/LandlordDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "@/pages/notFound/NotFound";
import ProtectedRoute from "@/components/route/ProtectedRoute";

export const router = createBrowserRouter(
  [
    { path: "/", Component: Login },
    { path: "/signup", Component: Signup },
    { path: "/select-role", Component: Home },

    {
      path: "/student",
      element: (
        <ProtectedRoute allowedRole="student">
          <StudentDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/landlord",
      element: (
        <ProtectedRoute allowedRole="landlord">
          <LandlordDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin",
      element: (
        <ProtectedRoute allowedRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      ),
    },

    { path: "*", Component: NotFound },
  ],
  { basename: "/campus-connect" }
);