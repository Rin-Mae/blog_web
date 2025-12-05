import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/adminLayout/AdminHeader";
import Footer from "../../components/adminLayout/AdminFooter";
import Sidebar from "../../components/adminLayout/Sidebar";
import SidebarTools from "../../components/admin/SidebarTools";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import AdminServices from "../../services/AdminServices";
import DOMPurify from "dompurify";

function PostView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [post, setPost] = useState(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await AdminServices.getPost(id);
        if (!mounted) return;
        setPost(res?.data ?? res ?? null);
      } catch (err) {
        console.error(err);
        setError("Failed to load post");
        toast.error("Failed to load post");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  const backendOrigin = (() => {
    const base = import.meta.env.VITE_API_BASE_URL || "";
    try {
      const url = new URL(base, window.location.origin);
      return url.origin;
    } catch {
      return base || window.location.origin;
    }
  })();

  const resolveImageUrl = (path) => {
    if (!path) return null;
    if (
      /^(https?:)?\/\//i.test(path) ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    )
      return path;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const origin = backendOrigin || window.location.origin;
    return `${origin}${normalized}`;
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <main className="p-3 p-lg-5">
        <div className="container-fluid">
          <Row className="g-4">
            <Col lg={8} xs={12} style={{ minWidth: 0 }}>
              {loading ? (
                <div className="d-flex justify-content-center my-5">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div>
                  <h2>Error</h2>
                  <p>{error}</p>
                </div>
              ) : post ? (
                <>
                  {post.featured_image ? (
                    <div className="position-relative mb-4 rounded overflow-hidden shadow-sm">
                      <img
                        src={resolveImageUrl(post.featured_image)}
                        className="w-100"
                        alt={post.title}
                        style={{ objectFit: "cover", maxHeight: "500px" }}
                      />
                    </div>
                  ) : null}

                  <div className="bg-white p-4 shadow-sm rounded mb-4">
                    <h1 className="display-5 fw-bold text-start text-wrap text-break mb-3">
                      {post.title}
                    </h1>
                    {post.subheader ? (
                      <p className="text-start text-muted text-wrap text-break mb-3">
                        {post.subheader}
                      </p>
                    ) : null}
                    <div className="text-start mb-4">
                      <small className="text-muted text-wrap text-break">
                        Published on{" "}
                        <strong>{formatDate(post.created_at)}</strong>
                        <span className="mx-2">•</span>
                        Author:{" "}
                        <strong>
                          {post.user
                            ? [post.user.firstname, post.user.lastname]
                                .filter(Boolean)
                                .join(" ")
                            : "Unknown"}
                        </strong>
                      </small>
                    </div>
                    <hr className="my-4" />
                    <article
                      className="fs-5 lh-lg text-wrap text-break"
                      style={{ color: "#444" }}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(post.content || ""),
                        }}
                      />
                    </article>
                  </div>
                </>
              ) : (
                <div>
                  <h2>Post not found</h2>
                  <p>The requested post was not found.</p>
                </div>
              )}
            </Col>

            <Col lg={4} xs={12} className="mt-3 mt-lg-0">
              <div>
                <SidebarTools post={post} />
              </div>
            </Col>
          </Row>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default PostView;
