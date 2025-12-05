import React, { useEffect, useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/images/logo.svg";
import { RxHamburgerMenu } from "react-icons/rx";
import MobilePublicSidebar from "./MobilePublicSidebar";

export default function Header({ onToggleSidebar, user }) {
  const [scrolled, setScrolled] = useState(false);
  const [showHeaderCta, setShowHeaderCta] = useState(false);
  const [showSidebarBrowse, setShowSidebarBrowse] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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

  // Observe main page Browse Blogs element (if present). If not present,
  // fall back to `showHeaderCta` so mobile sidebar behaves sensibly.
  useEffect(() => {
    const el = document.getElementById("browse-blogs-cta");
    if (!el || typeof IntersectionObserver === "undefined") {
      setShowSidebarBrowse(showHeaderCta);
      return undefined;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        // show sidebar browse when the main CTA is less than half visible
        setShowSidebarBrowse(e.intersectionRatio < 0.5);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [showHeaderCta]);
  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <Navbar expand="lg">
          <button
            type="button"
            className="sidebar-toggle me-3 d-lg-none btn btn-outline-secondary btn-lg"
            aria-label="Open menu"
            onClick={() => {
              if (onToggleSidebar) return onToggleSidebar();
              setShowMobileSidebar(true);
            }}
          >
            <RxHamburgerMenu size={24} />
          </button>
          <Navbar.Brand
            as={Link}
            to="/"
            className="logo d-flex align-items-center mx-auto"
          >
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
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="d-none" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {!user && (
                <Nav.Link
                  as={NavLink}
                  to="/login"
                  className={({ isActive }) =>
                    `nav-link${isActive ? " active" : ""}`
                  }
                >
                  Login
                </Nav.Link>
              )}
              {showHeaderCta && (
                <div className="header-cta ms-3">
                  <Link to="/blogs" className="btn btn-cta">
                    Browse Blogs
                  </Link>
                </div>
              )}
            </Nav>

            {/* header search removed - search is implemented on page-level components */}
          </Navbar.Collapse>
          <MobilePublicSidebar
            show={showMobileSidebar}
            onClose={() => setShowMobileSidebar(false)}
            user={user}
            showBrowse={showSidebarBrowse}
          />
        </Navbar>
      </div>
    </header>
  );
}
