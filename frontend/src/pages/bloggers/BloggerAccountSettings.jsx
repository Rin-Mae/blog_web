import { useState, useEffect } from "react";
import Footer from "../../components/bloggerlayout/BloggerFooter";
import Header from "../../components/bloggerlayout/BloggerHeader";
import Sidebar from "../../components/bloggerlayout/Sidebar";
import BloggerServices from "../../services/BloggerServices";
import AuthServices from "../../services/AuthServices";
import { toast } from "react-toastify";


function BloggerAccountSettings() {
  const placeholder = {
    firstName: "Bryan",
    lastName: "Cranston",
    email: "bryan.cranston@mail.com",
  };

  const [previewImage, setPreviewImage] = useState(
    "https://placehold.co/120x120?text=Profile"
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    email: "",
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      setIsFetchingProfile(true);
      try {
        const res = await BloggerServices.getProfile();
        const user = res?.user ?? res;
        if (mounted && user) {
          setFormData((prev) => ({ ...prev, email: user.email ?? prev.email }));
          setPreviewImage((prev) => user.profile_image_url ?? prev);
        }
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        if (mounted) setIsFetchingProfile(false);
      }
    };
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleEditToggle = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    const save = async () => {
      setIsLoading(true);
      setFieldErrors({});
      try {
        const payload = { email: formData.email };
        const anyPasswordFieldFilled = [
          formData.current_password,
          formData.password,
          formData.password_confirmation,
        ].some((v) => (v ?? "").trim() !== "");
        if (anyPasswordFieldFilled) {
          payload.current_password = formData.current_password;
          payload.password = formData.password;
          payload.password_confirmation = formData.password_confirmation;
        }
        await BloggerServices.updateProfile(payload);
        toast.success("Profile updated successfully");
        setIsEditing(false);
        if (anyPasswordFieldFilled) {
          setFormData((prev) => ({
            ...prev,
            current_password: "",
            password: "",
            password_confirmation: "",
          }));
        }
      } catch (err) {
        if (err?.response?.data?.errors) {
          setFieldErrors(err.response.data.errors);
        }
        const msg = err?.response?.data?.message || "Failed to update profile";
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    save();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate your account?")) {
      return;
    }
    try {
      setIsLoading(true);
      await BloggerServices.updateAccount("me", "deactivate");
      try {
        await AuthServices.logout();
      } catch {}
      window.location.href = "/login";
      toast.success("Account deactivated successfully");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to deactivate account";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "This will permanently delete your account and data. Continue?"
      )
    ) {
      return;
    }
    try {
      setIsLoading(true);
      await BloggerServices.updateAccount("me", "delete");
      toast.success("Account deleted successfully");
      try {
        await AuthServices.logout();
      } catch {}
      window.location.href = "/login";
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete account";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-md-3 col-lg-2 p-0">
            <Sidebar />
          </div>
          <main className="col-12 col-md-9 col-lg-10 bg-light  d-flex justify-content-center p-4">
            <div className="w-100" style={{ maxWidth: "1000px" }}>
              <div className="card shadow p-4">
                {/* Header */}
                <h2 className="fw-semibold">Account Settings</h2>
                <hr />

                {/* Email */}
                <div className="mt-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h5 className="fw-medium text-dark mb-0">Email</h5>
                    {isFetchingProfile && (
                      <span
                        className="spinner-border spinner-border-sm text-secondary"
                        role="status"
                        aria-hidden="true"
                        title="Loading"
                      ></span>
                    )}
                  </div>
                  {isEditing ? (
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="form-control-plaintext bg-light p-2 rounded">
                      {isFetchingProfile ? "Loading..." : formData.email}
                    </p>
                  )}
                  {fieldErrors.email && (
                    <div className="text-danger small mt-1">
                      {fieldErrors.email[0]}
                    </div>
                  )}
                </div>

                {/* Password + Confirm Password */}
                <div className="mt-4">
                  {isEditing ? (
                    <div className="row g-3">
                      {/* Current Password */}
                      <div className="col-md-4">
                        <label className="fw-medium text-dark mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="current_password"
                          value={formData.current_password}
                          onChange={handleChange}
                          placeholder="Enter current password"
                        />
                        {fieldErrors.current_password && (
                          <div className="text-danger small mt-1">
                            {fieldErrors.current_password[0]}
                          </div>
                        )}
                      </div>

                      {/* New Password */}

                      <div className="col-md-4">
                        <label className="fw-medium text-dark mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter new password"
                        />
                        {fieldErrors.password && (
                          <div className="text-danger small mt-1">
                            {fieldErrors.password[0]}
                          </div>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div className="col-md-4">
                        <label className="fw-medium text-dark mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          placeholder="Confirm password"
                        />
                        {fieldErrors.password_confirmation && (
                          <div className="text-danger small mt-1">
                            {fieldErrors.password_confirmation[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <label className="fw-medium text-dark mb-2">
                        Change Password
                      </label>
                      <p className="form-control-plaintext bg-light p-2 rounded">
                        ••••••••
                      </p>
                    </>
                  )}
                </div>

                <hr className="mt-4" />

                {/* Delete Account */}
                <div className="">
                  <h5 className="fw-medium text-dark mb-2 text-danger">
                    Deactivate or Delete Account
                  </h5>
                  <label className="form-label text-muted">
                    Deactivate your account or permanently delete your account
                    and all data.
                  </label>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      disabled={isLoading}
                      onClick={handleDeactivate}
                    >
                      Deactivate Account
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      disabled={isLoading}
                      onClick={handleDelete}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    className="btn btn-warning"
                    onClick={handleEditToggle}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Saving..."
                      : isEditing
                      ? "Save Changes"
                      : "Edit Details"}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default BloggerAccountSettings;
