import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PublicServices from "../../services/PublicServices";
import Rabbit from "../../assets/images/rabbit-hole.jpg";

function Sidebar() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const refreshBlogs = async (excludeId) => {
    setLoading(true);
    try {
      const res = await PublicServices.getRandomBlogs(3);
      if (!mountedRef.current) return;
      let items = res?.data ?? res ?? [];
      if (excludeId)
        items = items.filter((b) => b?.id !== excludeId).slice(0, 3);
      setBlogs(items);
    } catch (err) {
      if (!mountedRef.current) return;
      setBlogs([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    refreshBlogs();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const resolveImageUrl = (path) => {
    if (!path || (typeof path === "string" && !path.trim())) return Rabbit;
    if (
      /^(https?:)?\/\//i.test(path) ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    )
      return path;
    const base = import.meta.env.VITE_API_BASE_URL || "";
    let origin = "";
    try {
      const u = new URL(base);
      origin = `${u.protocol}//${u.host}`;
    } catch {
      origin = window.location.origin;
    }
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${origin}${normalized}`;
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(iso);
    }
  };

  return (
    <div className="border-0 rounded">
      <div className=" p-4">
        <h5 className="fw-bold mb-4">Other Blogs</h5>
        <hr />

        <div className="d-flex flex-column gap-4">
          {loading ? (
            <div className="d-flex justify-content-center py-3">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            (blogs || []).map((b) => (
              <Link
                to={`/blog/${b?.id}`}
                key={b?.id}
                className="d-flex align-items-center text-decoration-none text-dark blog-item-hover"
                onClick={() => refreshBlogs(b?.id)}
              >
                <img
                  src={resolveImageUrl(
                    b?.featured_image_url || b?.featured_image
                  )}
                  alt={b?.title || "Related Blog"}
                  className="rounded me-3 shadow-sm"
                  style={{ width: "95px", height: "70px", objectFit: "cover" }}
                />

                <div>
                  <h6
                    className="fw-semibold mb-1 text-wrap text-break text-start"
                    style={{ lineHeight: "1.2" }}
                  >
                    {b?.title}
                  </h6>
                  <small className="text-muted text-wrap text-break">
                    {formatDate(b?.created_at)}
                  </small>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
