import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import logo from "../../assets/images/logo.svg";

export default function MobilePublicSidebar({
  show,
  onClose,
  user,
  showBrowse,
}) {
  // start closed so we can animate opening even when `show` is true on first render
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  const u = user?.user ?? user ?? {};
  const firstName = u.firstname || "User";

  // Sync local open/visible states with `show` prop to animate
  useEffect(() => {
    if (show) {
      // make visible, then open (allowing CSS transition)
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setVisible(true);
      // next frame to ensure transition
      requestAnimationFrame(() => setOpen(true));
      // add root class and prevent body scroll
      document.documentElement.classList.add("mobile-sidebar-open");
      document.body.style.overflow = "hidden";
    } else {
      // start closing animation
      setOpen(false);
      // after transition, hide completely and remove root class
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        document.documentElement.classList.remove("mobile-sidebar-open");
        document.body.style.overflow = "";
      }, 260); // slightly longer than CSS transition (240ms)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [show]);

  if (!visible) return null;

  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? "visible" : ""}`}
        onClick={() => onClose && onClose()}
      />

      <aside
        className={`blogger-sidebar d-lg-none ${open ? "open" : ""}`}
        aria-label="Mobile navigation"
      >
        <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-2">
          <div className="d-flex align-items-center gap-2">
            <img src={logo} alt="BLOGGA" style={{ width: 40, height: 40 }} />
            <div>
              <div className="fw-bold">
                <span className="brand-initial">B</span>
                <span className="brand-rest">LOGGA</span>
              </div>
            </div>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <button
              type="button"
              className="btn btn-lg d-lg-none"
              aria-label="Close sidebar"
              onClick={() => onClose && onClose()}
            >
              <FiX size={22} aria-hidden="true" />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav p-3" aria-label="Public navigation">
          <ul className="list-unstyled">
            {!user && (
              <li>
                <h4 className="sidebar-heading">
                  <Link
                    to="/login"
                    className="btn btn-outline-secondary"
                    onClick={() => onClose && onClose()}
                  >
                    Login
                  </Link>
                </h4>
              </li>
            )}
            {showBrowse && (
              <li>
                <h4 className="sidebar-heading">
                  <Link
                    to="/blogs"
                    className="btn btn-cta w-100 text-white"
                    onClick={() => onClose && onClose()}
                  >
                    Browse Blogs
                  </Link>
                </h4>
              </li>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer p-3 mt-auto">
          <div className="small text-muted">
            © {new Date().getFullYear()} BLOGGA
          </div>
        </div>
      </aside>
    </>
  );
}
