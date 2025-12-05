import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import Footer from "../../components/publicLayout/PublicFooter";
import PublicHeader from "../../components/publicLayout/PublicHeader";
import BloggerHeader from "../../components/bloggerlayout/BloggerHeader";
import Sidebar from "../../components/bloggerlayout/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import PublicServices from "../../services/PublicServices";
import Rabbit from "../../assets/images/rabbit-hole.jpg";
import { FiEye } from "react-icons/fi";
import { Spinner } from "react-bootstrap";

function BlogList() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("published_desc");
  const sentinelRef = useRef(null);
  const firstPageLoadedRef = useRef(false);
  const perPage = 12;

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch blogs with pagination and search
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await PublicServices.getBlogs(
          page,
          perPage,
          debouncedSearch,
          sort || "published_desc"
        );
        const newItems = Array.isArray(res?.data) ? res.data : [];
        if (!cancelled) {
          setBlogs((prev) => (page === 1 ? newItems : [...prev, ...newItems]));
          if (page === 1) firstPageLoadedRef.current = true;
          const lastPage = res?.last_page ?? res?.meta?.last_page ?? page;
          const currentPage =
            res?.current_page ?? res?.meta?.current_page ?? page;
          const hasNext = Boolean(
            res?.next_page_url ?? res?.meta?.next_page_url ?? null
          );

          setHasMore(hasNext || currentPage < lastPage);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Failed to load blogs");
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, sort]);

  // Reset when search changes
  useEffect(() => {
    setBlogs([]);
    setHasMore(true);
    setPage(1);
    firstPageLoadedRef.current = false;
  }, [debouncedSearch, sort]);

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

  const getImageSrc = (blog) => {
    return (
      blog.featured_image_url ||
      (blog.featured_image ? resolveImageUrl(blog.featured_image) : Rabbit)
    );
  };

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

  const authorFullName = (blog) => {
    return (
      [blog.user?.firstname, blog.user?.lastname].filter(Boolean).join(" ") ||
      "Unknown"
    );
  };

  const fillToThree = (list) => {
    const l = list || [];
    return l.slice(0, 3);
  };

  const newestBlogs = fillToThree(
    [...blogs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  );
  const mostViewed = fillToThree(
    [...blogs].sort(
      (a, b) => Number(b.views_count || 0) - Number(a.views_count || 0)
    )
  );

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          hasMore &&
          !loading &&
          firstPageLoadedRef.current
        ) {
          setPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [hasMore, loading]);

  return (
    <>
      {user ? <BloggerHeader user={user} /> : <PublicHeader />}
      {user ? (
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-3 col-lg-2 p-0">
              <Sidebar />
            </div>
            <main className="col-12 col-md-9 col-lg-10 py-4">
              <div className="container">
                <div className="mb-4 page-search">
                  <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-8">
                      <form className="position-relative">
                        <span className="search-icon">
                          <FiSearch />
                        </span>
                        <input
                          className="form-control"
                          type="search"
                          placeholder="Search blogs or authors..."
                          style={{ paddingLeft: 36 }}
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                          }}
                        />
                      </form>
                    </div>
                    <div className="col-12 col-md-3">
                      <select
                        className="form-select"
                        value={sort}
                        onChange={(e) => {
                          setSort(e.target.value);
                          setPage(1);
                        }}
                        aria-label="Sort blogs"
                      >
                        <option value="published_desc">Newest first</option>
                        <option value="published_asc">Oldest first</option>
                        <option value="views_desc">Most viewed</option>
                        <option value="views_asc">Least viewed</option>
                        <option value="title_asc">Title A–Z</option>
                        <option value="title_desc">Title Z–A</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-1 d-grid">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setSearch("");
                          setSort("published_desc");
                          setPage(1);
                        }}
                        aria-label="Clear filters"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
                {/* ====================================== */}
                {/*  NEWEST / MOST VIEWED SECTION */}
                {/* ====================================== */}
                {!(debouncedSearch || (sort && sort !== "published_desc")) && (
                  <div className="row mb-5">
                    <div className="col-12 mb-4">
                      <h5 className="fw-bold mb-3">Latest Blogs</h5>
                      <div className="row">
                        {newestBlogs.map((blog) => (
                          <div key={blog.id} className="col-12 col-md-4 mb-3">
                            <Link
                              to={`/blog/${blog.id}`}
                              className="text-decoration-none text-dark"
                            >
                              <div className="card h-100 border-0 shadow-sm blog-card-hover position-relative pb-4">
                                <img
                                  src={getImageSrc(blog)}
                                  alt={blog.title}
                                  className="card-img-top text-wrap text-break"
                                  style={{
                                    height: "160px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div className="card-body">
                                  <h6 className="fw-semibold text-wrap text-break text-start">
                                    {blog.title}
                                  </h6>
                                  <p className="text-secondary small mb-3 text-wrap text-break text-start">
                                    {blog.subheader}
                                  </p>
                                  <p className="small text-muted mb-1">
                                    {formatDateTime(blog.created_at)}
                                  </p>
                                  <p className="small text-muted mb-1">
                                    {authorFullName(blog)}
                                  </p>
                                </div>
                                <div className="position-absolute bottom-0 start-0 m-3">
                                  <FiEye className="me-2" />
                                  <span>
                                    {Number(
                                      blog.views_count ?? 0
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-12 mb-4">
                      <h5 className="fw-bold mb-3">Most Viewed Blogs</h5>
                      <div className="row">
                        {mostViewed.map((blog) => (
                          <div key={blog.id} className="col-12 col-md-4 mb-3">
                            <Link
                              to={`/blog/${blog.id}`}
                              className="text-decoration-none text-dark"
                            >
                              <div className="card h-100 border-0 shadow-sm blog-card-hover position-relative pb-4">
                                <img
                                  src={getImageSrc(blog)}
                                  alt={blog.title}
                                  className="card-img-top"
                                  style={{
                                    height: "160px",
                                    objectFit: "cover",
                                  }}
                                />
                                <div className="card-body">
                                  <h6 className="fw-semibold text-wrap text-break text-start">
                                    {blog.title}
                                  </h6>
                                  <p className="text-secondary small mb-3 text-wrap text-break text-start">
                                    {blog.subheader}
                                  </p>
                                  <p className="small text-muted mb-1">
                                    {authorFullName(blog)}
                                  </p>
                                </div>
                                <div className="position-absolute bottom-0 start-0 m-3">
                                  <FiEye className="me-2" />
                                  <span>
                                    {Number(
                                      blog.views_count ?? 0
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ======================= */}
                {/* MAIN BLOG POSTS SECTION */}
                {/* ======================= */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="fw-bold">Blog Posts</h3>
                </div>

                <div className="row">
                  {loading && !firstPageLoadedRef.current ? (
                    <div className="col-12 d-flex justify-content-center my-4">
                      <Spinner
                        animation="border"
                        role="status"
                        variant="warning"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  ) : blogs.length ? (
                    blogs.map((blog) => (
                      <div key={blog.id} className="col-md-6 col-lg-4 mb-4">
                        <Link
                          to={`/blog/${blog.id}`}
                          className="text-decoration-none text-dark"
                        >
                          <div className="blog-card shadow-sm border-0 rounded overflow-hidden h-100 blog-hover position-relative pb-4">
                            <img
                              src={getImageSrc(blog)}
                              alt={blog.title}
                              className="img-fluid w-100"
                              style={{ height: "220px", objectFit: "cover" }}
                            />
                            <div className="p-3">
                              <h5 className="fw-semibold mb-2 blog-title-hover text-wrap text-break text-start">
                                {blog.title}
                              </h5>
                              <p className="text-muted small mb-2">
                                {formatDateTime(blog.created_at)}
                              </p>
                              <p className="text-muted small mb-2">
                                {authorFullName(blog)}
                              </p>
                              <p className="text-secondary small mb-3 text-wrap text-break text-start">
                                {blog.subheader}
                              </p>
                            </div>
                            <div className="position-absolute bottom-0 start-0 m-3">
                              <FiEye className="me-2" />
                              <span>
                                {Number(blog.views_count ?? 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-muted small">No blogs yet.</div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <div className="container py-4">
          <div className="mb-4 page-search">
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-8">
                <form className="position-relative">
                  <span className="search-icon">
                    <FiSearch />
                  </span>
                  <input
                    className="form-control"
                    type="search"
                    placeholder="Search blogs..."
                    style={{ paddingLeft: 36 }}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </form>
              </div>
              <div className="col-12 col-md-3">
                <select
                  className="form-select"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Sort blogs"
                >
                  <option value="published_desc">Newest first</option>
                  <option value="published_asc">Oldest first</option>
                  <option value="views_desc">Most viewed</option>
                  <option value="views_asc">Least viewed</option>
                  <option value="title_asc">Title A–Z</option>
                  <option value="title_desc">Title Z–A</option>
                </select>
              </div>
              <div className="col-12 col-md-1 d-grid">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearch("");
                    setSort("published_desc");
                    setPage(1);
                  }}
                  aria-label="Clear filters"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {!(debouncedSearch || (sort && sort !== "published_desc")) && (
            <div className="row mb-5">
              <div className="col-12 mb-4">
                <h5 className="fw-bold mb-3">Latest Blogs</h5>
                <div className="row">
                  {newestBlogs.map((blog) => (
                    <div key={blog.id} className="col-12 col-md-4 mb-3">
                      <Link
                        to={`/blog/${blog.id}`}
                        className="text-decoration-none text-dark"
                      >
                        <div className="card h-100 border-0 shadow-sm blog-card-hover position-relative pb-4">
                          <img
                            src={getImageSrc(blog)}
                            alt={blog.title}
                            className="card-img-top"
                            style={{ height: "160px", objectFit: "cover" }}
                          />
                          <div className="card-body">
                            <h6 className="fw-semibold text-wrap text-break text-start">
                              {blog.title}
                            </h6>
                            <p className="text-secondary small mb-3 text-wrap text-break text-start">
                              {blog.subheader}
                            </p>
                            <p className="small text-muted mb-1">
                              {formatDateTime(blog.created_at)}
                            </p>
                            <p className="small text-muted mb-1">
                              {authorFullName(blog)}
                            </p>
                          </div>
                          <div className="position-absolute bottom-0 start-0 m-3">
                            <FiEye className="me-2" />
                            <span>
                              {Number(blog.views_count ?? 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-12 mb-4">
                <h5 className="fw-bold mb-3">Most Viewed Blogs</h5>
                <div className="row">
                  {mostViewed.map((blog) => (
                    <div key={blog.id} className="col-12 col-md-4 mb-3">
                      <Link
                        to={`/blog/${blog.id}`}
                        className="text-decoration-none text-dark"
                      >
                        <div className="card h-100 border-0 shadow-sm blog-card-hover position-relative pb-4">
                          <img
                            src={getImageSrc(blog)}
                            alt={blog.title}
                            className="card-img-top"
                            style={{ height: "160px", objectFit: "cover" }}
                          />
                          <div className="card-body">
                            <h6 className="fw-semibold text-wrap text-break text-start">
                              {blog.title}
                            </h6>
                            <p className="text-secondary small mb-3 text-wrap text-break text-start">
                              {blog.subheader}
                            </p>
                            <p className="small text-muted mb-1">
                              {formatDateTime(blog.created_at)}
                            </p>
                            <p className="small text-muted mb-1">
                              {authorFullName(blog)}
                            </p>
                          </div>
                          <div className="position-absolute bottom-0 start-0 m-3">
                            <FiEye className="me-2" />
                            <span>
                              {Number(blog.views_count ?? 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================= */}
          {/* MAIN BLOG POSTS SECTION */}
          {/* ======================= */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold">Blog Posts</h3>
          </div>

          <div className="row">
            {loading && !firstPageLoadedRef.current ? (
              <div className="col-12 d-flex justify-content-center my-4">
                <Spinner animation="border" role="status" variant="warning">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : blogs.length ? (
              blogs.map((blog) => (
                <div key={blog.id} className="col-md-6 col-lg-4 mb-4">
                  <Link
                    to={`/blog/${blog.id}`}
                    className="text-decoration-none text-dark"
                  >
                    <div className="blog-card shadow-sm border-0 rounded overflow-hidden h-100 blog-hover position-relative pb-4">
                      <img
                        src={getImageSrc(blog)}
                        alt={blog.title}
                        className="img-fluid w-100"
                        style={{ height: "220px", objectFit: "cover" }}
                      />
                      <div className="p-3">
                        <h5 className="fw-semibold mb-2 blog-title-hover text-wrap text-break text-start">
                          {blog.title}
                        </h5>
                        <p className="text-muted small mb-2">
                          {formatDateTime(blog.created_at)}
                        </p>
                        <p className="text-muted small mb-2">
                          {authorFullName(blog)}
                        </p>
                        <p className="text-secondary small mb-3 text-wrap text-break text-start">
                          {blog.subheader}
                        </p>
                      </div>
                      <div className="position-absolute bottom-0 start-0 m-3">
                        <FiEye className="me-2" />
                        <span>
                          {Number(blog.views_count ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-12 text-muted small">No blogs yet.</div>
            )}
          </div>
        </div>
      )}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && firstPageLoadedRef.current && (
        <div className="d-flex justify-content-center my-3">
          <Spinner
            animation="grow"
            role="status"
            variant="secondary"
            size="sm"
            className="me-2"
          />
          <Spinner
            animation="grow"
            role="status"
            variant="secondary"
            size="sm"
            className="me-2"
          />
          <Spinner
            animation="grow"
            role="status"
            variant="secondary"
            size="sm"
          />
        </div>
      )}
      {!hasMore && !loading && (
        <div className="text-center text-muted my-3">No more blogs</div>
      )}
      <Footer />
    </>
  );
}

export default BlogList;
