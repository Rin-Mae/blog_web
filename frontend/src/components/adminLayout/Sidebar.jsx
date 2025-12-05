import React, { useEffect, useState } from "react";
import { FiX, FiLogOut } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import UserPlaceholder from "../../assets/images/user-placeholder.png";

export default function Sidebar({ visible, onClose, user, onLogout }) {
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 992;
  // If `visible` is provided, allow it to open the sidebar on mobile but
  // keep the sidebar visible by default on desktop. This prevents pages that
  // pass `visible={false}` (mobile-controlled) from hiding the sidebar on
  // Windows/desktop browsers.
  const [open, setOpen] = React.useState(() => {
    if (typeof visible === "boolean") return visible || isDesktop;
    return isDesktop;
  });

  // Keep open state in sync when a parent explicitly toggles `visible`.
  React.useEffect(() => {
    if (typeof visible === "boolean") {
      setOpen(
        visible || (typeof window !== "undefined" && window.innerWidth >= 992)
      );
    }
  }, [visible]);

  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener("toggle-admin-sidebar", handler);
    return () => window.removeEventListener("toggle-admin-sidebar", handler);
  }, []);

  useEffect(() => {
    const cls = "admin-sidebar-open";
    const noTrans = "no-admin-transitions";
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
    document.documentElement.classList.remove(cls);
    document.documentElement.classList.remove(noTrans);
    return undefined;
  }, [open]);

  const u = user?.user ?? user ?? {};
  const firstName = u.firstname || "User";

  const avatar = u.profile_image_url || UserPlaceholder;

  const navigate = useNavigate();
  const location = useLocation();

  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const pathname = location?.pathname || "";

  return (
    <div className={`admin-sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-2">
        <div className="d-flex align-items-center gap-2">
          <img
            src={avatar}
            alt={`${firstName} avatar`}
            style={{ width: 40, height: 40, borderRadius: 999 }}
          />
          <div>
            <div style={{ fontWeight: 700 }}>{firstName}</div>
            <div style={{ fontSize: "0.85rem", color: "rgba(0,0,0,0.6)" }}>
              Administrator
            </div>
          </div>
        </div>
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
      <nav className="sidebar-nav p-3" aria-label="Admin navigation">
        <ul className="list-unstyled">
          <li>
            <h4 className="sidebar-heading">
              <button
                type="button"
                className="sidebar-btn"
                onClick={() => navigate("/admin")}
                aria-current={
                  pathname === "/admin" ||
                  pathname.startsWith("/admin/dashboard")
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
                onClick={() => navigate("/admin/posts")}
                aria-current={
                  pathname.startsWith("/admin/posts") ? "true" : undefined
                }
              >
                Posts
              </button>
            </h4>
          </li>
          <li>
            <h4 className="sidebar-heading">
              <button
                type="button"
                className="sidebar-btn"
                onClick={() => navigate("/admin/users")}
                aria-current={
                  pathname.startsWith("/admin/users") ? "true" : undefined
                }
              >
                Users
              </button>
            </h4>
          </li>
          <li>
            <h4 className="sidebar-heading">
              <button
                type="button"
                className="sidebar-btn"
                onClick={() => navigate("/admin/profile")}
                aria-current={
                  pathname.startsWith("/admin/profile") ? "true" : undefined
                }
              >
                Profile
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
              if (typeof onLogout === "function") {
                res = await onLogout();
              } else if (typeof logout === "function") {
                res = await logout();
              }
              const msg = res?.message ?? "Logged out";
              toast.success(msg);
              navigate("/", { replace: true });
            } catch (e) {
              console.error(e);
              toast.error(e?.message || "Failed to logout");
            } finally {
              setLoggingOut(false);
            }
          }}
          disabled={loggingOut}
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
