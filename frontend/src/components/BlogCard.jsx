import React from "react";
import { Link } from "react-router-dom";
import rabbitImg from "../assets/images/rabbit placeholder.png";

export default function BlogCard({ post }) {
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <Link to={`/blog/${post.id}`} className="text-decoration-none text-dark">
        <div className="blog-card shadow-sm border-0 rounded overflow-hidden h-100 blog-hover">
          <img
            src={post.thumbnail || post.image || rabbitImg}
            alt={post.title}
            className="img-fluid w-100"
            style={{ height: "220px", objectFit: "cover" }}
          />
          <div className="p-3">
            <h5 className="fw-semibold mb-2 blog-title-hover text-wrap text-break text-start">
              {post.title}
            </h5>
            {post.subheader && (
              <p className="text-muted small mb-2 text-wrap text-break text-start">
                {post.subheader}
              </p>
            )}
            <p className="text-muted small mb-2">
              {new Date(
                post.published_at || post.date || Date.now()
              ).toLocaleDateString()}
            </p>
            <p className="text-secondary small mb-3 text-wrap text-break text-start">
              {post.excerpt || ""}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
