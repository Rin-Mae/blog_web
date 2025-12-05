import React, { useEffect, useState } from "react";
import { FiX, FiLogOut } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import UserPlaceholder from "../../assets/images/user-placeholder.png";

export default function Sidebar({ visible, onClose, user, logout }) {
  // Determine initial open state: use `visible` prop if provided,
  // otherwise default to desktop-open (>= lg breakpoint)
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 992;
  const [open, setOpen] = React.useState(() =>
    typeof visible === "boolean" ? visible : isDesktop
  );

  useEffect(() => {
    // Listen for a global toggle event (dispatched by header hamburger)
    const handler = () => setOpen((v) => !v);
    window.addEventListener("toggle-blogger-sidebar", handler);

    return () => window.removeEventListener("toggle-blogger-sidebar", handler);
  }, []);

  // Keep a document-level class for desktop so main content shifts when sidebar is open
  useEffect(() => {
    const cls = "blogger-sidebar-open";
    const noTrans = "no-blogger-transitions";
    const shouldApply =
      open && typeof window !== "undefined" && window.innerWidth >= 992;

    if (shouldApply) {
      document.documentElement.classList.add(noTrans);
      document.documentElement.classList.add(cls);
      const rafId = requestAnimationFrame(() => {
        setTimeout(() => document.documentElement.classList.remove(noTrans), 0);
      });
      return () => {
        cancelAnimationFrame(rafId);
        document.documentElement.classList.remove(cls);
        document.documentElement.classList.remove(noTrans);
      };
    }
    // if not applying, ensure class removed
    document.documentElement.classList.remove(cls);
    document.documentElement.classList.remove(noTrans);
    return undefined;
  }, [open]);

  const auth = useAuth();
  const u = auth.user?.user ?? user ?? {};

  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = u.firstname || u.lastname || u.name || "User";
  const avatar = u.profile_image_url || UserPlaceholder;

  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location?.pathname || "";

  return (
    <div className={`blogger-sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-2">
        <div className="d-flex align-items-center gap-2">
          <img
            src={avatar}
            alt={displayName ? `${displayName} avatar` : "Blogger avatar"}
            style={{ width: 40, height: 40, borderRadius: 999 }}
          />
          <div>
            <div style={{ fontWeight: 700 }}>{displayName}</div>
            <div style={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.6)" }}>
              Blogger
            </div>
          </div>
        </div>
        {/* Close button for mobile */}
        <div className="d-flex gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-md d-lg-none"
            aria-label="Close sidebar"
            onClick={() => {
              setOpen(false);
              if (typeof onClose === "function") onClose();
            }}
          >
            <FiX />
          </button>
        </div>
      </div>

      <nav className="sidebar-nav p-3" aria-label="Blogger navigation">
        <ul className="list-unstyled">
          <li>
            {/* Mobile-only Browse Blogs CTA (matches header style) */}
            {pathname !== "/blogs" && (
              <button
                type="button"
                className="btn btn-md btn-cta w-100 d-lg-none mb-2"
                aria-label="Browse Blogs"
                onClick={() => {
                  setOpen(false);
                  if (typeof onClose === "function") onClose();
                  navigate("/blogs");
                }}
              >
                Browse Blogs
              </button>
            )}
          </li>
          <li>
            <h4 className="sidebar-heading">
              <button
                type="button"
                className="sidebar-btn"
                onClick={() => navigate("/bloggers")}
                aria-current={
                  pathname === "/bloggers" ||
                  pathname.startsWith("/bloggers/dashboard")
                    ? "true"
                    : undefined
                }
              >
                Dashboard
              </button>
            </h4>
          </li>
          <li>
            <h4 className="sidebar-heading">
              <button
                type="button"
                className="sidebar-btn"
                onClick={() => navigate("/bloggers/my-blogs")}
                aria-current={
                  pathname === "/bloggers/my-blogs" ||
                  pathname.startsWith("/bloggers/my-blogs")
                    ? "true"
                    : undefined
                }
              >
                My Blogs
              </button>
            </h4>
          </li>
          <li>
            <h4 className="sidebar-heading">
              <button
                type="button"
                className="sidebar-btn"
                onClick={() => navigate("/bloggers/profile")}
                aria-current={
                  pathname.startsWith("/bloggers/profile") ? "true" : undefined
                }
              >
                Profile
              </button>
            </h4>
          </li>
          <li>
            <h4 className="sidebar-heading">
              <button
                type="button"
                className="sidebar-btn"
                onClick={() => navigate("/bloggers/account-settings")}
                aria-current={
                  pathname.startsWith("/bloggers/account-settings")
                    ? "true"
                    : undefined
                }
              >
                Account Settings
              </button>
            </h4>
          </li>
          
        </ul>
      </nav>

      <div className="sidebar-footer p-3 mt-auto">
        <button
          type="button"
          className="btn btn-danger w-100 d-lg-none"
          onClick={async () => {
            if (loggingOut) return;
            setLoggingOut(true);
            try {
              let res;
              if (typeof logout === "function") {
                res = await logout();
              } else if (auth && typeof auth.logout === "function") {
                res = await auth.logout();
              }
              const msg = res?.message ?? "Logged out";
              toast.success(msg);
              // navigate home after logout
              navigate("/", { replace: true });
            } catch (e) {
              console.error(e);
              toast.error(e?.message || "Failed to logout");
            } finally {
              setLoggingOut(false);
            }
          }}
        >
          {loggingOut ? (
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            />
          ) : (
            <FiLogOut className="me-2" />
          )}
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
