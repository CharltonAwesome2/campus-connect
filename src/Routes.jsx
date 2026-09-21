// src/Routes.jsx
import { createBrowserRouter } from "react-router";
import Login from "@pages/Login";
import Signup from "@pages/Signup";
import Home from "@pages/Home";
import StudentDashboard from "@pages/StudentDashboard";
import LandlordDashboard from "@pages/LandlordDashboard";
import AdminDashboard from "@pages/AdminDashboard";
import NotFound from "@pages/NotFound";
import ProtectedRoute from "@components/ProtectedRoute";

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