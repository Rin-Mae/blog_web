import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Footer from "../../components/bloggerlayout/BloggerFooter";
import Header from "../../components/bloggerlayout/BloggerHeader";
import { FiEdit2, FiTrash2, FiEye, FiPlus, FiSearch } from "react-icons/fi";
import Sidebar from "../../components/bloggerlayout/Sidebar";
import BloggerServices from "../../services/BloggerServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Rabbit from "../../assets/images/rabbit-hole.jpg";

function BloggerList() {
  const navigate = useNavigate();

  const [mostViewed, setMostViewed] = useState([]);
  const [loadingMostViewed, setLoadingMostViewed] = useState(true);
  const [myBlogs, setMyBlogs] = useState([]);
  const [loadingMyBlogs, setLoadingMyBlogs] = useState(true);
  const [query, setQuery] = useState("");
  const [deletingIds, setDeletingIds] = useState([]);

  // Resolve featured image URLs that come from backend like "/storage/..."
  const backendOrigin = (() => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    try {
      const u = new URL(base);
      return `${u.protocol}//${u.host}`;
    } catch {
      return "";
    }
  })();

  const resolveImageUrl = (path) => {
    // Fallback to local placeholder when no image is provided
    if (!path || (typeof path === "string" && !path.trim())) return Rabbit;
    // Already absolute or blob/data URIs
    if (
      /^(https?:)?\/\//i.test(path) ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    ) {
      return path;
    }
    // Normalize relative path coming from backend (e.g., storage)
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const origin = backendOrigin || window.location.origin;
    return `${origin}${normalized}`;
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return iso;
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await BloggerServices.getMostViewedBlogs();
        const items = Array.isArray(res?.data) ? res.data : [];
        if (isMounted) setMostViewed(items);
      } catch (e) {
        if (isMounted) setMostViewed([]);
      } finally {
        if (isMounted) setLoadingMostViewed(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await BloggerServices.getMyBlogs?.();
        const items = Array.isArray(res?.data) ? res.data : [];
        if (isMounted) setMyBlogs(items);
      } catch (e) {
        if (isMounted) setMyBlogs([]);
      } finally {
        if (isMounted) setLoadingMyBlogs(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers for edit/delete (stubs — replace with real logic as needed)
  function handleEdit(id) {
    navigate(`/bloggers/my-blogs/edit/${id}`);
  }

  async function handleDelete(id) {
    if (!id) return;
    // Confirmation
    const ok = window.confirm("Are you sure you want to delete this blog?");
    if (!ok) return;

    // Optimistic UI: mark as deleting, call API, then remove from lists
    setDeletingIds((s) => (s.includes(id) ? s : [...s, id]));
    try {
      await awaitDelete(id);
      toast.success("Blog deleted");
    } catch (err) {
      console.error("Failed to delete blog", err);
      toast.error(
        (err && err.message) || "Failed to delete blog. Please try again."
      );
    } finally {
      setDeletingIds((s) => s.filter((x) => x !== id));
    }
  }

  // Extracted async delete so we can `setDeletingIds` before awaiting.
  async function awaitDelete(id) {
    try {
      await BloggerServices.deleteBlog(id);
      setMyBlogs((prev) =>
        Array.isArray(prev) ? prev.filter((b) => b.id !== id) : prev
      );
      setMostViewed((prev) =>
        Array.isArray(prev) ? prev.filter((b) => b.id !== id) : prev
      );
    } catch (err) {
      throw err;
    }
  }

  const filteredBlogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source =
      Array.isArray(myBlogs) && myBlogs.length ? myBlogs : mostViewed;
    if (!q) return source;
    return source.filter((b) => {
      const haystack = [b.title, b.subheader, b.excerpt, b.author, b.created_at]
        .filter(Boolean)
        .join(" \n ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, myBlogs, mostViewed]);

  return (
    <>
      <div className={`blogger-layout sidebar-open`}>
        <Header />
        <div className="d-flex">
          <Sidebar />
          <main className="blogger-main flex-fill p-4">
            <div className="container-fluid">
              <div className="row mb-5">
                <div className="col-12 mb-4">
                  <h5 className="fw-bold mb-3">Most Viewed</h5>
                  <div className="row">
                    {loadingMostViewed ? (
                      <div className="col-12 text-muted small">Loading...</div>
                    ) : mostViewed.length ? (
                      mostViewed.map((blog, index) => (
                        <div
                          key={blog.id ?? index}
                          className="col-12 col-md-4 mb-3"
                        >
                          <Link
                            to={`/bloggers/my-blogs/${blog.id}`}
                            className="text-decoration-none text-dark"
                          >
                            <div className="card h-100 border-0 shadow-sm most-viewed-hover">
                              <img
                                src={resolveImageUrl(blog.featured_image)}
                                alt={blog.title}
                                className="card-img-top"
                                style={{ height: "160px", objectFit: "cover" }}
                              />
                              <div className="card-body">
                                <h6 className="fw-semibold text-wrap text-break text-start">
                                  {blog.title}
                                </h6>
                                <p className="text-muted small mb-2">
                                  {formatDate(blog.created_at)}
                                </p>
                                <p className="text-muted small mb-2 text-wrap text-break text-start">
                                  {blog.subheader}
                                </p>
                                <div className="d-inline-flex align-items-center px-2 py-1 mt-2">
                                  <FiEye className="me-2" />
                                  <span>
                                    {Number(blog.views ?? 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-muted small">
                        No most viewed blogs yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ======================= */}
              {/* Main Blog Posts */}
              {/* ======================= */}
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                <h3 className="fw-bold mb-0">Blog Posts</h3>
                <div className="d-flex align-items-center gap-5">
                  <div className="input-group" style={{ width: "400px" }}>
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Search your blogs..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Search blogs"
                    />
                    <span className="input-group-text bg-white">
                      <FiSearch />
                    </span>
                  </div>
                  {/* <Link
              to=""
              className="btn btn-outline-secondary btn-lg rounded-pill fw-semibold"
            >
              Manage Blogs
            </Link> */}
                  <Link
                    to="/bloggers/create"
                    className="fw-semibold d-inline-flex align-items-center justify-content-center"
                    aria-label="Create New Blog"
                    title="Create New Blog"
                  >
                    <FiPlus size={40} style={{ color: "#fc9d44" }} />
                  </Link>
                </div>
              </div>

              <div className="row">
                {loadingMyBlogs ? (
                  <div className="col-12 text-muted small">Loading...</div>
                ) : filteredBlogs.length ? (
                  filteredBlogs.map((blog, index) => (
                    <div
                      key={blog.id ?? index}
                      className="col-md-6 col-lg-4 mb-4"
                    >
                      <div className="position-relative">
                        <Link
                          to={`/bloggers/my-blogs/${blog.id}`}
                          className="text-decoration-none text-dark"
                        >
                          <div className="blog-card shadow-sm border-0 rounded overflow-hidden h-100 blog-hover pb-4">
                            <img
                              src={resolveImageUrl(blog.featured_image)}
                              alt={blog.title}
                              className="img-fluid w-100"
                              style={{ height: "220px", objectFit: "cover" }}
                            />
                            <div className="p-3">
                              <h5 className="fw-semibold mb-2 blog-title-hover text-wrap text-break text-start">
                                {blog.title}
                              </h5>
                              {blog.subheader ? (
                                <p className="text-muted small mb-2 text-wrap text-break text-start">
                                  {blog.subheader}
                                </p>
                              ) : null}
                              <p className="text-muted small mb-2">
                                {formatDate(blog.created_at)}
                              </p>
                            </div>
                            <div className="position-absolute bottom-0 end-0 m-3 d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-light border"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleEdit(blog.id);
                                }}
                              >
                                <FiEdit2 />
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDelete(blog.id);
                                }}
                              >
                                {deletingIds.includes(blog.id) ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                ) : (
                                  <FiTrash2 />
                                )}
                              </button>
                            </div>

                            {/* viewers badge - positioned outside the Link so it isn't nested inside an anchor */}
                            <div className="position-absolute bottom-0 start-0 m-3">
                              <FiEye className="me-2" />
                              <span>
                                {Number(blog.views ?? 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-muted small">No blogs yet.</div>
                )}
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default BloggerList;
