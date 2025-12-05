import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import api from "../../services/api";
import rabbitImg from "../../assets/images/rabbit placeholder.png";

export default function Trending() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hoverSide, setHoverSide] = useState(null); // 'left' | 'right' | null
  const containerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/blogs/trending?limit=5`);
        const data = res?.data?.data ?? [];
        if (!cancelled) setItems(data.slice(0, 5));
      } catch (e) {
        console.error("Failed to load trending blogs:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Autoplay: advance every 10 seconds, but pause while hovering
  useEffect(() => {
    if (!items.length || items.length < 2) return;
    if (isHovering) return; // pause when user hovers

    const id = setInterval(() => {
      setIndex((i) => (items.length ? (i + 1) % items.length : 0));
    }, 5000);

    return () => clearInterval(id);
  }, [items.length, isHovering]);

  // Keep index in range when items change
  useEffect(() => {
    if (items.length && index >= items.length) {
      setIndex(0);
    }
  }, [items.length]);

  const prev = () => setIndex((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
  const next = () => setIndex((i) => (items.length ? (i + 1) % items.length : 0));

  const current = items[index];

  const imageSrc = (post) =>
    post?.featured_image_url || post?.featured_image || rabbitImg;

  return (
    <section id="latest-trending" className="py-5">
      <div className="container">
        <h2 className="mb-4">Trending</h2>

        <div
          ref={containerRef}
          className="trending-carousel position-relative"
          style={{ minHeight: 240 }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setHoverSide(null);
          }}
        >
          {/* Left interactive overlay (narrower, gradient darker on outside) */}
          <div
            onMouseEnter={() => setHoverSide("left")}
            onMouseLeave={() => setHoverSide(null)}
            onClick={prev}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "22%",
              zIndex: 5,
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            aria-hidden
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0))",
                opacity: hoverSide === "left" ? 1 : 0,
                transition: "opacity 200ms ease",
              }}
            />
          </div>

          {/* Right interactive overlay (narrower, gradient darker on outside) */}
          <div
            onMouseEnter={() => setHoverSide("right")}
            onMouseLeave={() => setHoverSide(null)}
            onClick={next}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "22%",
              zIndex: 5,
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            aria-hidden
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(to left, rgba(0,0,0,0.45), rgba(0,0,0,0))",
                opacity: hoverSide === "right" ? 1 : 0,
                transition: "opacity 200ms ease",
              }}
            />
          </div>

          {/* Arrows (icons only) */}
          {hoverSide === "left" && (
            <FaArrowLeft
              onClick={prev}
              size={28}
              style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", zIndex: 10, color: "#fff", cursor: "pointer" }}
              aria-label="Previous"
            />
          )}
          {hoverSide === "right" && (
            <FaArrowRight
              onClick={next}
              size={28}
              style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", zIndex: 10, color: "#fff", cursor: "pointer" }}
              aria-label="Next"
            />
          )}

          {/* Slide track: render all slides and animate via transform */}
          <div className="d-flex justify-content-center">
            {loading ? (
              <div className="text-center">Loading…</div>
            ) : items.length ? (
              <div style={{ width: "100%", maxWidth: 980, overflow: "hidden" }}>
                <div
                  className="slide-track d-flex"
                  style={{
                    width: `${items.length * 100}%`,
                    transform: `translateX(-${index * (100 / items.length)}%)`,
                    transition: "transform 600ms ease",
                  }}
                >
                  {items.map((s, i) => (
                      <Link
                        key={s.id}
                        to={`/blog/${s.id}`}
                        className="text-decoration-none text-dark"
                        style={{ flex: `0 0 ${100 / items.length}%`, maxWidth: `${100 / items.length}%`, paddingRight: 12, paddingLeft: 12 }}
                      >
                        <div className="card border-0 shadow-sm mb-4 blog-card" style={{ overflow: "hidden", opacity: i === index ? 1 : 0.5, transition: 'opacity 450ms ease' }}>
                        <div style={{ height: 260, overflow: "hidden" }}>
                          <img
                            src={imageSrc(s)}
                            alt={s.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            loading="lazy"
                          />
                        </div>

                        <div className="card-body py-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h3 className="mb-1" style={{ fontSize: "1.25rem" }}>{s.title}</h3>
                              <div className="text-muted small">{s.subheader}</div>
                              <div className="text-muted small">By {s.user ? [s.user.firstname, s.user.lastname].filter(Boolean).join(' ') : 'Unknown'}</div>
                            </div>
                            <div className="text-end small text-muted">
                              <div aria-label={`${s.views_count ?? 0} views`} title={`${s.views_count ?? 0} views`}>
                                <FiEye aria-hidden="true" />
                                <span className="ms-1">{(s.views_count ?? 0).toLocaleString()}</span>
                              </div>
                              <div>{new Date(s.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-muted">No trending posts yet</div>
            )}
          </div>

          {/* Dots / indicators */}
          <div className="d-flex justify-content-center mt-2" role="tablist" aria-label="Trending slides">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-selected={i === index}
                style={{
                  width: 44,
                  height: 8,
                  background: '#fff',
                  opacity: i === index ? 1 : 0.45,
                  border: 'none',
                  borderRadius: 4,
                  marginRight: 8,
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
