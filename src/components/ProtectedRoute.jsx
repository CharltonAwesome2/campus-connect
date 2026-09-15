// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@context/AuthContext";

export default function ProtectedRoute({ allowedRole, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Logged in but wrong role — send them to their own dashboard
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}