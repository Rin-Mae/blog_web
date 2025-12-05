import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import AdminServices from "../../services/AdminServices";

function SidebarTools({ post, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setLoading(true);
    try {
      if (!post || !post.id) {
        throw new Error("No post selected");
      }

      await AdminServices.deletePost(post.id);
      toast.success("Post deleted");
      onDeleted && onDeleted(post.id);
      navigate("/admin/posts");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to delete post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-3 sidebar-tools">
      <h5 className="mb-3">Tools</h5>
      <div className="d-grid gap-2">
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={loading}
          aria-label="Delete post"
        >
          <FaTrash className="me-2" /> {loading ? "Deleting..." : "Delete"}
        </Button>

        <Button variant="light" onClick={() => navigate("/admin/posts")}>
          Back to list
        </Button>
      </div>
    </div>
  );
}

export default SidebarTools;
