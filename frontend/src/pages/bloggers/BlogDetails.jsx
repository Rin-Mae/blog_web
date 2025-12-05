import { Link, useNavigate, useParams } from "react-router-dom";
import { FiEdit2, FiTrash2, FiArrowLeft } from "react-icons/fi";
import Footer from "../../components/bloggerlayout/BloggerFooter";
import Header from "../../components/bloggerlayout/BloggerHeader";
import Sidebar from "../../components/bloggerlayout/Sidebar";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import BloggerServices from "../../services/BloggerServices";
import { toast } from "react-toastify";
import Rabbit from "../../assets/images/rabbit-hole.jpg";

function BloggerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Resolve backend origin for storage paths
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
    // Fallback to local placeholder when missing
    if (!path || (typeof path === "string" && !path.trim())) return Rabbit;
    if (
      /^(https?:)?\/\//i.test(path) ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    ) {
      return path;
    }
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const origin = backendOrigin || window.location.origin;
    return `${origin}${normalized}`;
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await BloggerServices.getBlogDetails(id);
        if (mounted) setBlog(res?.data ?? null);
      } catch (e) {
        if (mounted) setBlog(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);
  return (
    <>
      <Header />

      <div className="container mx-auto">
        <div className="row">
          <div className="col-12 col-md-3 col-lg-2 p-0">
            <Sidebar />
          </div>
          <main
            className="col-12 col-md-9 col-lg-10"
            style={{ overflowX: "hidden" }}
          >
            <div className="container py-5">
              {/* Manage Blog Section */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                {/* Back Button on the Left */}
                <Link
                  to="/bloggers/my-blogs"
                  className="text-secondary d-inline-flex align-items-center icon-action"
                  aria-label="Back to list"
                  title="Back to list"
                  style={{ textDecoration: "none", cursor: "pointer" }}
                >
                  <FiArrowLeft size={35} />
                </Link>

                {/* Edit & Delete Buttons on the Right */}
                <div className="d-flex align-items-center gap-3">
                  <Link
                    to={`/bloggers/my-blogs/edit/${id}`}
                    className="text-primary d-inline-flex align-items-center icon-action"
                    aria-label="Edit Blog"
                    title="Edit Blog"
                    style={{ textDecoration: "none", cursor: "pointer" }}
                  >
                    <FiEdit2 size={25} />
                  </Link>{" "}
                  |
                  <button
                    type="button"
                    className="bg-transparent border-0 p-0 text-danger d-inline-flex align-items-center icon-action"
                    aria-label="Delete Blog"
                    title="Delete Blog"
                    style={{ cursor: "pointer" }}
                    onClick={async () => {
                      const ok = window.confirm(
                        "Are you sure you want to delete this blog? This action cannot be undone."
                      );
                      if (!ok) return;
                      try {
                        await BloggerServices.deleteBlog(id);
                        toast.success("Blog deleted successfully");
                        navigate("/bloggers/my-blogs");
                      } catch (e) {
                        toast.error("Failed to delete blog");
                      }
                    }}
                  >
                    <FiTrash2 size={25} />
                  </button>
                </div>
              </div>

              <hr className="my-4" />

              {loading ? (
                <div className="d-flex justify-content-center my-5">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Blog Hero Image */}
                  {blog ? (
                    <div className="position-relative mb-4 rounded overflow-hidden shadow-sm">
                      <img
                        src={resolveImageUrl(blog.featured_image)}
                        className="w-100"
                        alt={blog.title}
                        style={{ objectFit: "cover", maxHeight: "500px" }}
                      />
                    </div>
                  ) : null}

                  {/* Blog Article */}
                  <div className="bg-white p-5 shadow-sm rounded mb-4">
                    {/* Title */}
                    <h1 className="display-5 fw-bold text-start mb-3 text-wrap text-break">
                      {blog?.title || ""}
                    </h1>

                    {/* Subheader */}
                    {blog?.subheader ? (
                      <p className="text-start text-muted mb-3 text-wrap text-break">
                        {blog.subheader}
                      </p>
                    ) : null}

                    <div className="text-start mb-4">
                      <small className="text-muted text-wrap text-break">
                        Published on <strong></strong>
                        <span className="mx-2">
                          <strong>{formatDate(blog.created_at)}</strong>
                        </span>
                        Author: <strong>{blog?.user?.name || "You"}</strong>
                        {blog?.updated_at ? (
                          <>
                            <span className="mx-2">•</span>
                            Last edited:{" "}
                            <strong>{formatDate(blog.updated_at)}</strong>
                          </>
                        ) : null}
                      </small>
                    </div>

                    <hr className="my-4" />

                    {/* Blog Content */}
                    <article
                      className="fs-5 lh-lg text-wrap text-break"
                      style={{ color: "#444" }}
                    >
                      {/* Client-side sanitize content before inserting into DOM */}
                      <div
                        className="blog-content"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(blog?.content || ""),
                        }}
                      />
                    </article>
                  </div>
                </>
              )}

              {/* Comments Section */}
              {/* <div className="comments-section">
                <h4 className="fw-bold mb-4">Comments</h4>

                <form className="mb-5">
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="commentName"
                      placeholder="Name"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="commentText" className="form-label">
                      Comment
                    </label>
                    <textarea
                      className="form-control"
                      id="commentText"
                      rows="4"
                      placeholder="Write your comment..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-warning rounded-pill px-4"
                  >
                    Submit
                  </button>
                </form>

                <div className="list-group">
                  <div className="list-group-item mb-3 shadow-sm rounded">
                    <div className="d-flex justify-content-between mb-2">
                      <strong>Jane Smith</strong>
                      <small className="text-muted">Feb 2, 2025</small>
                    </div>
                    <p className="mb-0">
                      Great post! Really enjoyed the insights about React and
                      modern frontend development.
                    </p>
                  </div>

                  <div className="list-group-item mb-3 shadow-sm rounded">
                    <div className="d-flex justify-content-between mb-2">
                      <strong>Mark Wilson</strong>
                      <small className="text-muted">Feb 3, 2025</small>
                    </div>
                    <p className="mb-0">
                      Thanks for sharing this. Very helpful for someone getting
                      started in web development.
                    </p>
                  </div>

                  <div className="list-group-item shadow-sm rounded">
                    <div className="d-flex justify-content-between mb-2">
                      <strong>Emily Johnson</strong>
                      <small className="text-muted">Feb 5, 2025</small>
                    </div>
                    <p className="mb-0">
                      I appreciate the detailed explanation. Looking forward to
                      more posts like this!
                    </p>
                  </div>
                </div>
              </div> */}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default BloggerDetails;
