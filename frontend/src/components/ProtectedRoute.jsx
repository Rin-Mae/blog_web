import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (
    user?.account_status === "deactivated" &&
    location.pathname !== "/bloggers/deactivated"
  ) {
    return <Navigate to="/bloggers/deactivated" replace />;
  }

  return children;
}

export default ProtectedRoute;
