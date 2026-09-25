// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@context/AuthContext";

export default function ProtectedRoute({ allowedRole, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}