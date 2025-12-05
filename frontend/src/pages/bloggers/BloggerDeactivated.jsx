import { useAuth } from "../../contexts/AuthContext";
import BloggerServices from "../../services/BloggerServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function BloggerDeactivated() {
  const { logout, user, checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("You have been logged out.");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleActivate = async () => {
    try {
      await BloggerServices.updateAccount(user?.id, "activate");
      await checkAuth();
      toast.success("Account activated.");
      navigate("/bloggers", { replace: true });
    } catch (error) {
      toast.error("Activation failed. Please try again.");
    }
  };

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div className="card text-center shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Account Deactivated</h2>
          <p className="card-text">Your account is currently deactivated.</p>
          <p className="card-text">
            Do you want to activate your account again?
          </p>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <button className="btn btn-primary" onClick={handleActivate}>
              Activate
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BloggerDeactivated;
