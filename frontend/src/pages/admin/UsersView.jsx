import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/adminLayout/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import AdminServices from "../../services/AdminServices";
import AdminHeader from "../../components/adminLayout/AdminHeader";

function UsersView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await AdminServices.getUser(id);
        setDetails(res.user);
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) setError("User not found.");
        else if (status === 403)
          setError("You don't have permission to view this user.");
        else
          setError(
            err.response?.data?.message || "Failed to fetch user details"
          );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return String(d).slice(0, 10);
    }
  };

  return (
    <>
      <AdminHeader onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <main className="p-4">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="m-0">View User</h2>
            <div className="d-flex gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/admin/users")}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/admin/users/${id}`)}
              >
                Edit
              </button>
            </div>
          </div>

          <div className="card shadow-sm position-relative">
            {loading && (
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
                style={{ zIndex: 10 }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            <div className="card-body">
              {error ? (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              ) : (
                details && (
                  <>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1">
                          {details.firstname} {details.lastname}
                        </h5>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="text-muted">
                            User ID: {details.id}
                          </span>
                          {/* Status Badge */}
                          {details.status && (
                            <span
                              className={`badge ${
                                details.status === "banned"
                                  ? "bg-danger"
                                  : details.status === "active"
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                              title={`Status: ${details.status}`}
                            >
                              {details.status === "deactivated"
                                ? "deactivated"
                                : details.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-end">
                        {Array.isArray(details.roles) &&
                        details.roles.length > 0 ? (
                          details.roles.map((r, i) => (
                            <span
                              key={i}
                              className="badge bg-info text-dark ms-1"
                            >
                              {r}
                            </span>
                          ))
                        ) : (
                          <span className="badge bg-secondary">No role</span>
                        )}
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="border rounded p-3 h-100">
                          <h6 className="text-uppercase text-muted mb-3">
                            Contact
                          </h6>
                          <div className="mb-2">
                            <strong>Email:</strong>{" "}
                            <span className="text-muted">
                              {details.email || "-"}
                            </span>
                          </div>
                          <div className="mb-2">
                            <strong>Contact Number:</strong>{" "}
                            <span className="text-muted">
                              {details.contact_number || "-"}
                            </span>
                          </div>
                          <div className="mb-2">
                            <strong>Address:</strong>{" "}
                            <span className="text-muted">
                              {details.address || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="border rounded p-3 h-100">
                          <h6 className="text-uppercase text-muted mb-3">
                            Profile
                          </h6>
                          <div className="mb-2">
                            <strong>Middlename:</strong>{" "}
                            <span className="text-muted">
                              {details.middlename || "-"}
                            </span>
                          </div>
                          <div className="mb-2">
                            <strong>Birthdate:</strong>{" "}
                            <span className="text-muted">
                              {formatDate(details.birthdate)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <strong>Gender:</strong>{" "}
                            <span className="text-muted">
                              {details.gender || "-"}
                            </span>
                          </div>
                          <div className="mb-2">
                            <strong>Age:</strong>{" "}
                            <span className="text-muted">
                              {details.age ?? "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row g-3 mt-3">
                      <div className="col-12">
                        <div className="border rounded p-3">
                          <h6 className="text-uppercase text-muted mb-3">
                            Timestamps
                          </h6>
                          <div className="mb-2">
                            <strong>Created At:</strong>{" "}
                            <span className="text-muted">
                              {formatDate(details.created_at)}
                            </span>
                          </div>
                          <div className="mb-2">
                            <strong>Updated At:</strong>{" "}
                            <span className="text-muted">
                              {formatDate(details.updated_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default UsersView;
