import React, { useState } from "react";
import logo from "../../assets/images/logo.svg";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CreateAccount() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    address: "",
    contact_number: "",
    gender: "",
    email: "",
    age: "",
    birthdate: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      toast.success("Registration successful. You may now log in.");
      navigate("/login");
    } catch (err) {
      const data = err.response?.data;
      if (data?.message && typeof data.message === "object") {
        setErrors(data.message);
      } else if (data?.message) {
        toast.error(data.message);
      } else {
        toast.error("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <section id="create-account" className="create-account auth-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="mb-2 text-start">
              <Link to="/" className="small text-muted">
                ← Back to Home
              </Link>
            </div>
            <h2 className="mb-3 text-center">Create your Blogger account</h2>
            <p className="text-center text-muted mb-4">
              Join as a blogger to publish posts, track views, and manage your
              dashboard.
            </p>

            <div className="card shadow border">
              <div className="card-body">
                <div className="text-center mb-4">
                  <img
                    src={logo}
                    alt="BLOGGA logo"
                    style={{ width: 56 }}
                    className="d-block mx-auto mb-2"
                  />
                </div>

                <form className="signup-form" onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">First name</label>
                      <input
                        type="text"
                        name="firstname"
                        className="form-control"
                        aria-label="First name"
                        required
                        style={{ borderColor: "#6c757d" }}
                        value={form.firstname}
                        onChange={handleChange}
                      />
                      {errors.firstname && (
                        <div className="text-danger small mt-1">
                          {errors.firstname[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Middle name</label>
                      <input
                        type="text"
                        name="middlename"
                        className="form-control"
                        aria-label="Middle name"
                        style={{ borderColor: "#6c757d" }}
                        value={form.middlename}
                        onChange={handleChange}
                      />
                      {errors.middlename && (
                        <div className="text-danger small mt-1">
                          {errors.middlename[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Last name</label>
                      <input
                        type="text"
                        name="lastname"
                        className="form-control"
                        aria-label="Last name"
                        required
                        style={{ borderColor: "#6c757d" }}
                        value={form.lastname}
                        onChange={handleChange}
                      />
                      {errors.lastname && (
                        <div className="text-danger small mt-1">
                          {errors.lastname[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        aria-label="Address"
                        required
                        style={{ borderColor: "#6c757d" }}
                        value={form.address}
                        onChange={handleChange}
                      />
                      {errors.address && (
                        <div className="text-danger small mt-1">
                          {errors.address[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        name="contact_number"
                        className="form-control"
                        aria-label="Phone"
                        required
                        style={{ borderColor: "#6c757d" }}
                        value={form.contact_number}
                        onChange={handleChange}
                      />
                      {errors.contact_number && (
                        <div className="text-danger small mt-1">
                          {errors.contact_number[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Gender</label>
                      <select
                        name="gender"
                        className="form-select"
                        aria-label="Gender"
                        style={{ borderColor: "#6c757d" }}
                        value={form.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      {errors.gender && (
                        <div className="text-danger small mt-1">
                          {errors.gender[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Email address</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        aria-label="Email"
                        required
                        style={{ borderColor: "#6c757d" }}
                        value={form.email}
                        onChange={handleChange}
                      />
                      {errors.email && (
                        <div className="text-danger small mt-1">
                          {errors.email[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Age</label>
                      <input
                        type="number"
                        name="age"
                        className="form-control"
                        aria-label="Age"
                        required
                        style={{ borderColor: "#6c757d" }}
                        value={form.age}
                        onChange={handleChange}
                      />
                      {errors.age && (
                        <div className="text-danger small mt-1">
                          {errors.age[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Birthdate</label>
                      <input
                        type="date"
                        name="birthdate"
                        className="form-control"
                        aria-label="Birthdate"
                        required
                        style={{ borderColor: "#6c757d" }}
                        value={form.birthdate}
                        onChange={handleChange}
                      />
                      {errors.birthdate && (
                        <div className="text-danger small mt-1">
                          {errors.birthdate[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        aria-label="Password"
                        required
                        style={{ borderColor: "#6c757d" }}
                        value={form.password}
                        onChange={handleChange}
                      />
                      {errors.password && (
                        <div className="text-danger small mt-1">
                          {errors.password[0]}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Confirm password</label>
                      <input
                        type="password"
                        name="password_confirmation"
                        className="form-control"
                        aria-label="Confirm password"
                        required
                        style={{ borderColor: "#6c757d" }}
                        value={form.password_confirmation}
                        onChange={handleChange}
                      />
                      {errors.password_confirmation && (
                        <div className="text-danger small mt-1">
                          {errors.password_confirmation[0]}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-auto mx-auto">
                      <button
                        type="submit"
                        className="btn btn-cta"
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create Account"}
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mb-3 mt-2">
                    <Link to="/login" className="small">
                      Already have an account? Log in
                    </Link>
                  </div>

                  <p className="form-text text-muted mt-1">
                    By creating an account you agree to our terms. We'll never
                    share your email.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
