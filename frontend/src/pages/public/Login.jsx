import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/images/logo.svg";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const credentials = { email, password };
    setLoading(true);
    try {
      const userData = await authLogin(credentials);

      if (userData.account_status === "deactivated") {
        navigate("/bloggers/deactivated");
        toast.warn(userData.message);
      } else if (userData.roles?.[0] === "blogger") {
        navigate("/bloggers");
        toast.success(userData.message);
      } else if (userData.roles?.[0] === "admin") {
        navigate("/admin");
        toast.success(userData.message);
      }
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      const isSuspended = err?.response?.status === 403;

      if (isSuspended && serverMessage) {
        setError(serverMessage);
        toast.error(serverMessage);
      } else {
        const fallback = "Invalid email or password. Please try again.";
        setError(fallback);
        toast.error(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login" className="py-5 auth-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-sm-10 col-md-8 col-lg-5">
            <div className="mb-2 text-start">
              <Link to="/" className="small text-muted">
                ← Back to Home
              </Link>
            </div>
            <div className="card auth-card shadow-sm">
              <div className="card-body">
                <div className="auth-brand text-center mb-3">
                  <img
                    src={logo}
                    alt="BLOGGA logo"
                    style={{ width: 56 }}
                    className="d-block mx-auto mb-2"
                  />
                  <div className="brand text-uppercase">
                    <span className="brand-initial">B</span>
                    <span className="brand-rest">LOGGA</span>
                  </div>
                </div>

                <h4 className="card-title text-center mb-3">
                  Login to your account
                </h4>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="d-flex justify-content-end mb-3">
                    <Link to="/create-account" className="small">
                      Create account
                    </Link>
                  </div>

                  <div className="d-grid">
                    <button
                      className="btn btn-cta"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Login"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <p className="text-center mt-3 small text-muted">
              You will be redirected to your dashboard after signing in (once
              connected).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
