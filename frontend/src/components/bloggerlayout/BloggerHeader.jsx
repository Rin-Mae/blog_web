import React, { useEffect, useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/images/logo.svg";

export default function Header({ user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [showHeaderCta, setShowHeaderCta] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isBrowseBlogsPage = location.pathname === "/blogs";

  const { logout, user: authUser } = useAuth();
  const userName =
    (user && (user.name || user.username || user.email)) ||
    (authUser && (authUser.name || authUser.username || authUser.email));

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

  useEffect(() => {
    const hero = document.getElementById("home");
    if (!hero || typeof IntersectionObserver === "undefined") return;

    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        // show header CTA when less than half of hero is visible
        setShowHeaderCta(e.intersectionRatio < 0.5);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    obs.observe(hero);
    return () => obs.disconnect();
  }, []);
  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <Navbar expand="lg">
          {/* Mobile: hamburger toggles blogger sidebar (fires global event) */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary me-2 d-lg-none"
            aria-label="Toggle sidebar"
            onClick={() =>
              window.dispatchEvent(new Event("toggle-blogger-sidebar"))
            }
          >
            <span className="navbar-toggler-icon" />
          </button>

          <Navbar.Brand href="#home" className="logo d-flex align-items-center">
            <img
              src={logo}
              alt="BLOGGA logo"
              style={{ width: 48, height: "auto" }}
              className="me-3"
            />
            <span className="brand">
              <span className="brand-initial">B</span>
              <span className="brand-rest">LOGGA</span>
            </span>
          </Navbar.Brand>
          {/* Collapse is shown only on lg+; on mobile logout is available in sidebar */}
          <Navbar.Collapse id="user-navbar-nav" className="d-none d-lg-flex">
            <Nav className="ms-auto align-items-center">
              {!isBrowseBlogsPage && (
                <div className="mt-auto">
                  <Link to="/blogs" className="btn btn-md btn-cta">
                    Browse Blogs
                  </Link>
                </div>
              )}
              {userName && (
                <span className="ms-3 me-3 text-muted small">{userName}</span>
              )}
              <button
                type="button"
                className="btn btn-md btn-outline-danger ms-3"
                onClick={handleLogout}
              >
                Logout
              </button>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    </header>
  );
}
