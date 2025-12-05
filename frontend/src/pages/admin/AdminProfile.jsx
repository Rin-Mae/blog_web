import React, { useEffect, useState } from "react";
import Sidebar from "../../components/adminLayout/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import AdminServices from "../../services/AdminServices";
import { toast } from "react-toastify";
import AdminHeader from "../../components/adminLayout/AdminHeader";
import { FaEdit } from "react-icons/fa";
import UserPlaceholder from "../../assets/images/user-placeholder.png";

function AdminProfile() {
  const { user, checkAuth } = useAuth();
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
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await AdminServices.getProfile();
        const u = res.user || {};
        const normalizedBirthdate = u.birthdate
          ? String(u.birthdate).slice(0, 10)
          : "";
        setFormData({
          firstname: u.firstname || "",
          middlename: u.middlename || "",
          lastname: u.lastname || "",
          email: u.email || "",
          contact_number: u.contact_number || "",
          gender: u.gender || "",
          age: u.age || "",
          address: u.address || "",
          birthdate: normalizedBirthdate,
          current_password: "",
          password: "",
          password_confirmation: "",
        });
        setRoles(Array.isArray(u.roles) ? u.roles : []);
        setProfileImageUrl(u.profile_image_url || UserPlaceholder);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSelectedImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const clearSelectedImage = () => {
    setSelectedImageFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(UserPlaceholder);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setFieldErrors({});
      const payload = { ...formData };
      const anyPasswordFieldFilled = [
        payload.current_password,
        payload.password,
        payload.password_confirmation,
      ].some((v) => (v ?? "").trim() !== "");

      if (!anyPasswordFieldFilled) {
        delete payload.password;
        delete payload.password_confirmation;
        delete payload.current_password;
      }
      if (selectedImageFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v);
        });
        fd.append("profile_image", selectedImageFile);
        const res = await AdminServices.updateProfile(fd);
        const u = res.user || {};
        setProfileImageUrl(u.profile_image_url || UserPlaceholder);
        clearSelectedImage();
      } else {
        await AdminServices.updateProfile(payload);
      }
      // Refresh auth user so Sidebar updates avatar and name
      await checkAuth();
      toast.success("Profile updated successfully");
      if (anyPasswordFieldFilled) {
        setFormData((prev) => ({
          ...prev,
          current_password: "",
          password: "",
          password_confirmation: "",
        }));
        setShowPassword(false);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorsObj = err.response.data.errors;
        setFieldErrors(errorsObj);
      } else {
        setError(err.response?.data?.message);
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
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="m-0">My Profile</h2>
          </div>

          <div className="card shadow border position-relative">
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
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label d-block">Profile Image</label>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        position: "relative",
                        width: 160,
                        height: 160,
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: "#f1f3f5",
                        border: "1px solid #dee2e6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {previewUrl || profileImageUrl ? (
                        <img
                          src={previewUrl || profileImageUrl}
                          alt="Profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <img
                          src={UserPlaceholder}
                          alt="Profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <label
                        className="mb-0"
                        style={{
                          position: "absolute",
                          bottom: 8,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 10px",
                          background: "rgba(255,255,255,0.95)",
                          color: "#212529",
                          border: "1px solid #dee2e6",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: saving || loading ? "not-allowed" : "pointer",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                          opacity: saving || loading ? 0.7 : 1,
                          userSelect: "none",
                        }}
                        title="Edit profile image"
                      >
                        <FaEdit size={12} />
                        Edit
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={saving || loading}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                    {previewUrl && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={clearSelectedImage}
                        disabled={saving || loading}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {fieldErrors.profile_image && (
                    <div className="text-danger small mt-1">
                      {fieldErrors.profile_image[0]}
                    </div>
                  )}
                </div>
                {roles.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label d-block">Role</label>
                    <div className="d-flex flex-wrap gap-2">
                      {roles.map((r) => (
                        <span key={r} className="badge bg-secondary">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">First Name</label>
                    <input
                      className="form-control"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      disabled={saving || loading}
                      style={{ borderColor: "#6c757d" }}
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
                      className="form-control"
                      name="middlename"
                      value={formData.middlename}
                      onChange={handleChange}
                      disabled={saving || loading}
                      style={{ borderColor: "#6c757d" }}
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
                      className="form-control"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      disabled={saving || loading}
                      style={{ borderColor: "#6c757d" }}
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
                    disabled={saving || loading}
                    style={{ borderColor: "#6c757d" }}
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
                      className="form-control"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      disabled={saving || loading}
                      style={{ borderColor: "#6c757d" }}
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
                      disabled={saving || loading}
                      style={{ borderColor: "#6c757d" }}
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
                      disabled={saving || loading}
                      style={{ borderColor: "#6c757d" }}
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
                      disabled={saving || loading}
                      style={{ borderColor: "#6c757d" }}
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
                    rows="3"
                    disabled={saving || loading}
                    style={{ borderColor: "#6c757d" }}
                  />
                  {fieldErrors.address && (
                    <div className="text-danger small mt-1">
                      {fieldErrors.address[0]}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label m-0">Change Password</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setShowPassword((s) => !s)}
                      disabled={saving || loading}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {showPassword && (
                    <div className="row mt-2">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Current Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="current_password"
                          value={formData.current_password}
                          onChange={handleChange}
                          disabled={saving || loading}
                          style={{ borderColor: "#6c757d" }}
                        />
                        {fieldErrors.current_password && (
                          <div className="text-danger small mt-1">
                            {fieldErrors.current_password[0]}
                          </div>
                        )}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={saving || loading}
                          style={{ borderColor: "#6c757d" }}
                        />
                        {fieldErrors.password && (
                          <div className="text-danger small mt-1">
                            {fieldErrors.password[0]}
                          </div>
                        )}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          disabled={saving || loading}
                          style={{ borderColor: "#6c757d" }}
                        />
                        {fieldErrors.password_confirmation && (
                          <div className="text-danger small mt-1">
                            {fieldErrors.password_confirmation[0]}
                          </div>
                        )}
                      </div>
                      {fieldErrors.message && (
                        <div className="col-12">
                          <div className="text-danger small">
                            {fieldErrors.message}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2">
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

export default AdminProfile;
