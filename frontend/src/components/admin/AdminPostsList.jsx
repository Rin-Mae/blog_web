import React, { useEffect, useMemo, useRef, useState } from "react";
import { Row, Col, Form, Button, Spinner } from "react-bootstrap";
import PostCard from "./PostCard";
import { FiSearch } from "react-icons/fi";
import AdminServices from "../../services/AdminServices";

function AdminPostsList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("published_desc");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef(null);
  const firstPageLoadedRef = useRef(false);
  const pageSize = 12;

  // Debounce the search input to avoid firing queries on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await AdminServices.getPosts(
          page,
          pageSize,
          debouncedSearch,
          sortBy
        );
        const newItems = Array.isArray(res?.data) ? res.data : [];
        if (!cancelled) {
          setPosts((prev) => (page === 1 ? newItems : [...prev, ...newItems]));
          if (page === 1) {
            firstPageLoadedRef.current = true;
          }
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
          setError("Failed to load posts.");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, sortBy]);

  // Reset list when search changes and refetch from page 1 (server-side filtering)
  useEffect(() => {
    setPosts([]);
    setHasMore(true);
    setPage(1);
    firstPageLoadedRef.current = false;
    // We'll refetch via the effect above using debouncedSearch
  }, [debouncedSearch]);

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

  // Results are already sorted server-side; no client-side sorting needed
  const filtered = posts;

  return (
    <div>
      <Row className="mb-3 align-items-center">
        <Col md={6} sm={12} className="mb-2 mb-md-0">
          <Form className="d-flex position-relative admin-search">
            <span className="search-icon">
              <FiSearch />
            </span>
            <Form.Control
              placeholder="Search posts or bloggers..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: "36px" }}
            />
          </Form>
        </Col>

        <Col md={6} sm={12} className="text-end">
          <Form.Select
            value={sortBy}
            style={{ width: 220, display: "inline-block" }}
            onChange={(e) => {
              setSortBy(e.target.value);
              // Reset and refetch from first page for new sort order
              setPosts([]);
              setPage(1);
              setHasMore(true);
              firstPageLoadedRef.current = false;
            }}
            aria-label="Sort posts"
          >
            <option value="published_desc">Sort by: Newest</option>
            <option value="published_asc">Oldest</option>
            <option value="views_desc">Most viewed</option>
            <option value="views_asc">Least viewed</option>
            <option value="title_asc">Title: A → Z</option>
            <option value="title_desc">Title: Z → A</option>
          </Form.Select>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </Col>
      </Row>

      {error && <div className="text-danger mt-3">{error}</div>}
      {loading && (
        <div className="d-flex justify-content-center my-3">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Loading…</span>
        </div>
      )}

      <div ref={sentinelRef} style={{ height: 1 }} />
      {!hasMore && !loading && (
        <div className="text-center text-muted my-3">No more posts</div>
      )}
    </div>
  );
}

export default AdminPostsList;
