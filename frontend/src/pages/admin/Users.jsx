import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { useAuth } from "../../contexts/AuthContext";
import AdminServices from "../../services/AdminServices";
import Header from "../../components/adminLayout/AdminHeader";
import Footer from "../../components/adminLayout/AdminFooter";
import Sidebar from "../../components/adminLayout/Sidebar";
import { toast } from "react-toastify";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

function Users() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 5,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMounted = React.useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      fetchUsers(1);
      isMounted.current = true;
    } else {
      const timer = setTimeout(() => {
        fetchUsers(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const data = await AdminServices.getUsers(page, searchQuery);
      setUsers(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
        per_page: data.per_page,
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await AdminServices.deleteUser(userId);
      toast.success(response.message);
      await fetchUsers(pagination.current_page);
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.status === "inactive") return;
    const nextStatus = user.status === "banned" ? "active" : "banned";
    const confirmMessage =
      nextStatus === "banned"
        ? "Are you sure you want to ban this user?"
        : "Are you sure you want to set this user to active?";

    if (!confirm(confirmMessage)) return;
    try {
      const res = await AdminServices.updateUserStatus(user.id, nextStatus);
      toast.success(res.message || `Status set to ${nextStatus}`);
      await fetchUsers(pagination.current_page);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.errors?.status?.[0] ||
          "Failed to update status"
      );
    }
  };

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <main className="p-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="m-0">Users</h2>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              aria-label="Search users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <>
          <div className="table-responsive border rounded">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td className="p-3">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={
                              u.profile_image_url ||
                              `https://i.pravatar.cc/100?u=user-${u.id}`
                            }
                            alt={`${u.firstname || "User"} avatar`}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 999,
                              objectFit: "cover",
                              border: "1px solid #e9ecef",
                            }}
                          />
                          <span>
                            {[u.firstname, u.middlename, u.lastname]
                              .filter(Boolean)
                              .join(" ")}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.roles?.[0] || "No role"}</td>
                      <td className="p-3">
                        <div className="d-flex align-items-center gap-2">
                          {u.status === "deactivated" ? (
                            <div
                              aria-label="Deactivated"
                              title="Deactivated"
                              style={{
                                position: "relative",
                                width: 80,
                                height: 28,
                                borderRadius: 15,
                                backgroundColor: "#6c757d", // secondary
                                display: "flex",
                                alignItems: "center",
                                padding: "0 8px",
                                fontSize: 10,
                                fontWeight: 600,
                                color: "#fff",
                                userSelect: "none",
                              }}
                            >
                              <span style={{ flex: 1, textAlign: "center" }}>
                                Deactivated
                              </span>
                            </div>
                          ) : u.roles?.includes("admin") ? (
                            <div
                              aria-label={`${u.status || "unknown"}`}
                              title={`${u.status || "unknown"}`}
                              style={{
                                position: "relative",
                                width: 80,
                                height: 28,
                                borderRadius: 15,
                                backgroundColor:
                                  u.status === "banned"
                                    ? "#dc3545"
                                    : u.status === "active"
                                    ? "#198754"
                                    : "#6c757d",
                                display: "flex",
                                alignItems: "center",
                                padding: "0 8px",
                                fontSize: 10,
                                fontWeight: 600,
                                color: "#fff",
                                userSelect: "none",
                              }}
                            >
                              <span
                                style={{
                                  flex: 1,
                                  textAlign: "center",
                                  fontSizwe: 10,
                                }}
                              >
                                {u.status === "deactivated"
                                  ? "Deactivated"
                                  : (u.status || "Unknown").replace(/^./, (c) =>
                                      c.toUpperCase()
                                    )}
                              </span>
                            </div>
                          ) : (
                            <div
                              className="status-toggle"
                              onClick={() => handleToggleStatus(u)}
                              role="button"
                              aria-label="Toggle status"
                              title={
                                u.status === "banned"
                                  ? "Click to set active"
                                  : "Click to ban user"
                              }
                              style={{
                                position: "relative",
                                width: 80,
                                height: 28,
                                borderRadius: 15,
                                cursor: "pointer",
                                backgroundColor:
                                  u.status === "banned" ? "#dc3545" : "#198754",
                                transition: "background-color 0.25s",
                                display: "flex",
                                alignItems: "center",
                                padding: "0 8px",
                                fontSize: 10,
                                fontWeight: 600,
                                color: "#fff",
                                userSelect: "none",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  top: 3,
                                  left:
                                    u.status === "banned" ? 80 - (22 + 8) : 8,
                                  width: 22,
                                  height: 22,
                                  background: "#fff",
                                  borderRadius: 12,
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                                  transition: "left 0.25s",
                                }}
                              />
                              <span
                                style={{
                                  flex: 1,
                                  textAlign:
                                    u.status === "banned" ? "left" : "right",
                                  paddingLeft: u.status === "banned" ? 4 : 0,
                                  paddingRight: u.status === "banned" ? 0 : 4,
                                }}
                              >
                                {u.status === "banned" ? "Banned" : "Active"}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-success"
                            aria-label="View"
                            title="View"
                            onClick={() =>
                              navigate(`/admin/users/view/${u.id}`)
                            }
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            aria-label="Edit"
                            title="Edit"
                            onClick={() => navigate(`/admin/users/${u.id}`)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            aria-label="Delete"
                            title="Delete"
                            onClick={() => handleDelete(u.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 text-muted">
            <div>
              Showing {users.length} of {pagination.total} users
            </div>
            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              breakLabel={"..."}
              pageCount={pagination.last_page}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={(selected) => fetchUsers(selected.selected + 1)}
              containerClassName={"pagination mb-0"}
              pageClassName={"page-item"}
              pageLinkClassName={"page-link"}
              previousClassName={"page-item"}
              previousLinkClassName={"page-link"}
              nextClassName={"page-item"}
              nextLinkClassName={"page-link"}
              breakClassName={"page-item"}
              breakLinkClassName={"page-link"}
              activeClassName={"active"}
              disabledClassName={"disabled"}
              forcePage={pagination.current_page - 1}
            />
          </div>
        </>
      </main>
      <Footer />
    </>
  );
}

export default Users;
