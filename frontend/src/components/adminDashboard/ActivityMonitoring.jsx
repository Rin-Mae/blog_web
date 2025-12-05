import React, { useEffect, useState } from "react";
import AdminServices from "../../services/AdminServices";

export default function ActivityMonitoring() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [perPage] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await AdminServices.getDashboardActivity(1, perPage);
        setRecentBlogs(res.recentBlogs || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load activity");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [perPage]);

  const formatDate = (isoOrString) => {
    if (!isoOrString) return "";
    try {
      const d = new Date(isoOrString);
      if (isNaN(d.getTime())) return String(isoOrString);
      const formatter = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return formatter.format(d);
    } catch (e) {
      return String(isoOrString);
    }
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Recently Created Blogs</h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center">
                        <div
                          className="spinner-border spinner-border-sm text-primary"
                          role="status"
                        />
                      </td>
                    </tr>
                  ) : (
                    recentBlogs.map((r, idx) => (
                      <tr key={r.id}>
                        <td>{idx + 1}</td>
                        <td>{r.title}</td>
                        <td>{r.author}</td>
                        <td>{formatDate(r.created)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <small className="text-muted">
                  Showing {recentBlogs.length} recent blogs
                </small>
              </div>
              {error && (
                <div className="alert alert-warning mb-0" role="alert">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
