import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (user) {
    const hasAdminRole = user.roles?.[0] === "admin";
    return <Navigate to={hasAdminRole ? "/admin" : "/bloggers"} replace />;
  }

  return children;
}
