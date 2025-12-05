import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import rabbitImg from "../../assets/images/rabbit placeholder.png";

function PostCard({ post }) {
  const formatPublishedDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      const formatter = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      return formatter.format(d);
    } catch {
      return String(iso);
    }
  };

  const publishedDate = formatPublishedDate(post.created_at);
  const views = post.views_count ?? 0;
  const authorName = post.user
    ? [post.user.firstname, post.user.lastname].filter(Boolean).join(" ") ||
      "Unknown"
    : "Unknown";
  const imageSrc =
    post.featured_image_url ||
    post.featured_image ||
    post.thumbnail ||
    post.image ||
    rabbitImg;

  return (
    <Link
      to={`/admin/posts/${post.id}`}
      className="text-decoration-none text-body"
    >
      <Card className="mb-4">
        <div style={{ height: 180, overflow: "hidden" }}>
          <img
            src={imageSrc}
            alt={post.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        </div>

        <Card.Body className="py-2">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1 text-wrap text-break">{post.title}</h5>
              <div className="text-muted small text-wrap text-break">
                {post.subheader}
              </div>
              <div className="text-muted small">By {authorName}</div>
            </div>

            <div className="text-end small text-muted">
              <div
                aria-label={`${views.toLocaleString()} views`}
                title={`${views.toLocaleString()} views`}
              >
                <FiEye aria-hidden="true" />
                <span className="ms-1">{views.toLocaleString()}</span>
              </div>
              <div>{publishedDate}</div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default PostCard;
