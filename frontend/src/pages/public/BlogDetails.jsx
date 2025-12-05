import Footer from "../../components/publicLayout/PublicFooter";
import Header from "../../components/publicLayout/PublicHeader";
import OtherBlogsNavi from "../../components/publicLayout/OtherBlogsNavi";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

import PublicServices from "../../services/PublicServices";
import Rabbit from "../../assets/images/rabbit-hole.jpg";
import DOMPurify from "dompurify";
import BloggerHeader from "../../components/bloggerlayout/BloggerHeader";
import Sidebar from "../../components/bloggerlayout/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";

function BlogDetails() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await PublicServices.getBlog(id);
        if (!mounted) return;
        setBlog(res?.data ?? res ?? null);
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load blog");
        setBlog(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const formatDateTime = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(d);
    } catch {
      return String(iso);
    }
  };

  const authorFullName = (b) =>
    [b?.user?.firstname, b?.user?.lastname].filter(Boolean).join(" ") ||
    "Unknown";

  return (
    <>
      {user ? <BloggerHeader user={user} /> : <Header />}

      {user ? (
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-3 col-lg-2 p-0">
              <Sidebar />
            </div>
            <main className="col-12 col-md-9 col-lg-10">
              <div className="container">
                <div className="mb-3 mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                    style={{ padding: "8px 12px", fontSize: "1.15rem" }}
                  >
                    <IoMdArrowRoundBack style={{ fontSize: "1.25rem" }} />
                  </button>
                </div>
                <div className="d-flex">
                  <div className="container py-5">
                    {loading ? (
                      <div className="d-flex justify-content-center my-5">
                        <div
                          className="spinner-border text-warning"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="alert alert-danger">{error}</div>
                    ) : blog ? (
                      <div className="position-relative mb-4 rounded overflow-hidden shadow-sm">
                        <img
                          src={resolveImageUrl(
                            blog.featured_image_url || blog.featured_image
                          )}
                          className="w-100"
                          alt={blog.title}
                          style={{ objectFit: "cover", maxHeight: "500px" }}
                        />
                      </div>
                    ) : null}

                    <div className="bg-white p-5 shadow-sm rounded">
                      <h1 className="display-5 fw-bold text-wrap text-break text-start mb-3">
                        {blog?.title || ""}
                      </h1>
                      <div className="mb-4">
                        <small className="text-muted text-wrap text-break text-start">
                          Published on{" "}
                          <strong>{formatDateTime(blog?.created_at)}</strong>
                          <span className="mx-2">•</span>
                          Author: <strong>{authorFullName(blog)}</strong>
                        </small>
                      </div>
                      <hr className="my-4" />
                      <article
                        className="fs-5 lh-lg blog-content text-wrap text-break"
                        style={{ color: "#444" }}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(blog?.content || ""),
                          }}
                        />
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="mb-3 mt-3">
            <button
              type="button"
              className="btn d-inline-flex align-items-center justify-content-center"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              style={{ padding: "8px 12px", fontSize: "1.15rem" }}
            >
              <IoMdArrowRoundBack style={{ fontSize: "1.25rem" }} />
            </button>
          </div>
          <div className="row">
            <div className="col-12 col-md-9">
              <div className="container py-5">
                {/* Blog Hero Image */}
                {loading ? (
                  <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : blog ? (
                  <div className="position-relative mb-4 rounded overflow-hidden shadow-sm">
                    <img
                      src={resolveImageUrl(
                        blog.featured_image_url || blog.featured_image
                      )}
                      className="w-100"
                      alt={blog.title}
                      style={{ objectFit: "cover", maxHeight: "500px" }}
                    />
                  </div>
                ) : null}

                {/* Blog Article */}
                <div className="bg-white p-5 shadow-sm rounded">
                  {/* Title */}
                  <h1 className="display-5 fw-bold text-wrap text-break text-start mb-3">
                    {blog?.title || ""}
                  </h1>

                  <div className="mb-4">
                    <small className="text-muted text-wrap text-break text-start">
                      Published on{" "}
                      <strong>{formatDateTime(blog?.created_at)}</strong>
                      <span className="mx-2">•</span>
                      Author: <strong>{authorFullName(blog)}</strong>
                    </small>
                  </div>

                  <hr className="my-4" />

                  {/* Blog Content */}
                  <article
                    className="fs-5 lh-lg blog-content text-wrap text-break"
                    style={{ color: "#444" }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(blog?.content || ""),
                      }}
                    />
                  </article>
                </div>
              </div>
            </div>
            <aside className="col-12 col-md-3 order-last order-md-0">
              <OtherBlogsNavi />
            </aside>
          </div>
        </div>
      )}

      {/* <div className="container">
        <div className="comments-section">
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
            <button type="submit" className="btn btn-warning rounded-pill px-4">
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
                Great post! Really enjoyed the insights about React and modern
                frontend development.
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
                I appreciate the detailed explanation. Looking forward to more
                posts like this!
              </p>
            </div>
          </div>
        </div>
      </div> */}

      <Footer />
    </>
  );
}

export default BlogDetails;
