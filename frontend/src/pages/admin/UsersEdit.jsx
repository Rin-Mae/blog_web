import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminServices from "../../services/AdminServices";
import Sidebar from "../../components/adminLayout/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import AdminHeader from "../../components/adminLayout/AdminHeader";

function UsersEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    email: "",
    contact_number: "",
    gender: "",
    age: "",
    address: "",
    birthdate: "",
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await AdminServices.getUser(id);
      const userData = response.user;
      const normalizedBirthdate = userData.birthdate
        ? String(userData.birthdate).slice(0, 10)
        : "";
      setFormData({
        firstname: userData.firstname || "",
        middlename: userData.middlename || "",
        lastname: userData.lastname || "",
        email: userData.email || "",
        contact_number: userData.contact_number || "",
        gender: userData.gender || "",
        age: userData.age || "",
        address: userData.address || "",
        birthdate: normalizedBirthdate,
      });
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError("User not found.");
      } else if (status === 403) {
        setError("You don't have permission to view this user.");
      } else {
        setError("Failed to fetch user details");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setFieldErrors({});
      await AdminServices.updateUser(id, formData);
      toast.success("User updated successfully");
      navigate("/admin/users");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const errorsObj = err.response.data.errors;
        setFieldErrors(errorsObj);
        // Show a general error banner as well
        const errorMessages = Object.values(errorsObj).flat().join(", ");
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || "Failed to update user");
      }
    } finally {
      setSaving(false);
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
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="m-0">Edit User</h2>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/admin/users")}
            >
              Back
            </button>
          </div>

          {/* Removed top-level error alert; per-field errors are shown inline */}

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
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      required
                      disabled={saving || loading}
                    />
                    {fieldErrors.firstname && (
                      <div className="text-danger small mt-1">
                        {fieldErrors.firstname[0]}
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Middle Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="middlename"
                      value={formData.middlename}
                      onChange={handleChange}
                      disabled={saving || loading}
                    />
                    {fieldErrors.middlename && (
                      <div className="text-danger small mt-1">
                        {fieldErrors.middlename[0]}
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                      disabled={saving || loading}
                    />
                    {fieldErrors.lastname && (
                      <div className="text-danger small mt-1">
                        {fieldErrors.lastname[0]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={saving || loading}
                  />
                  {fieldErrors.email && (
                    <div className="text-danger small mt-1">
                      {fieldErrors.email[0]}
                    </div>
                  )}
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Contact Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      required
                      disabled={saving || loading}
                    />
                    {fieldErrors.contact_number && (
                      <div className="text-danger small mt-1">
                        {fieldErrors.contact_number[0]}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Birthdate</label>
                    <input
                      type="date"
                      className="form-control"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      required
                      disabled={saving || loading}
                    />
                    {fieldErrors.birthdate && (
                      <div className="text-danger small mt-1">
                        {fieldErrors.birthdate[0]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      disabled={saving || loading}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {fieldErrors.gender && (
                      <div className="text-danger small mt-1">
                        {fieldErrors.gender[0]}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-control"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      min="1"
                      disabled={saving || loading}
                    />
                    {fieldErrors.age && (
                      <div className="text-danger small mt-1">
                        {fieldErrors.age[0]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="3"
                    disabled={saving || loading}
                  ></textarea>
                  {fieldErrors.address && (
                    <div className="text-danger small mt-1">
                      {fieldErrors.address[0]}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => navigate("/admin/users")}
                    disabled={saving || loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving || loading}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default UsersEdit;
