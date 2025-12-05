import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function DeactivatedGate() {
  const location = useLocation();
  const { user } = useAuth();

  if (
    user?.account_status === "deactivated" &&
    location.pathname !== "/bloggers/deactivated"
  ) {
    return <Navigate to="/bloggers/deactivated" replace />;
  }

  return null;
}

export default DeactivatedGate;
