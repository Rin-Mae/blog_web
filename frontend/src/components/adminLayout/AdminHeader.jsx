import React, { useEffect, useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.svg";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

export default function AdminHeader({ userName, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      let res;
      if (onLogout) {
        res = await onLogout();
      } else {
        res = await logout();
      }
      const msg = res?.message;
      toast.success(msg);
    } catch (e) {
      toast.error("Failed to logout. Please try again.");
    } finally {
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`site-header admin-header ${scrolled ? "scrolled" : ""}`}
    >
      <div className="container">
        <Navbar expand="lg">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary me-2 d-lg-none"
            aria-label="Toggle sidebar"
            onClick={() =>
              window.dispatchEvent(new Event("toggle-admin-sidebar"))
            }
          >
            <span className="navbar-toggler-icon" />
          </button>

          <Navbar.Brand
            as={Link}
            to="/"
            className="logo d-flex align-items-center mx-auto"
          >
            <img
              src={logo}
              alt="BLOGGA logo"
              style={{ width: 40, height: "auto" }}
              className="me-2"
            />
            <span className="brand">
              <span className="brand-initial">B</span>
              <span className="brand-rest">LOGGA</span>
            </span>
          </Navbar.Brand>

          {/* Collapse visible only on lg+; mobile logout moved to sidebar */}
          <Navbar.Collapse id="admin-navbar-nav" className="d-none d-lg-flex">
            <Nav className="ms-auto align-items-center">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={handleLogout}
              >
                Logout
              </button>
              {userName && (
                <span className="ms-3 me-3 text-muted small">{userName}</span>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    </header>
  );
}
