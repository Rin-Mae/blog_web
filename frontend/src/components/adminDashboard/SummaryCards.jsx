import React, { useEffect, useState } from "react";
import AdminServices from "../../services/AdminServices";

export default function SummaryCards() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    totalBlogs: 0,
    totalBloggers: 0,
    totalViews: 0,
    totalViewsMonth: 0,
    totalViewsWeek: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await AdminServices.getDashboardSummary();
        setData({
          totalBlogs: res.totalBlogs ?? 0,
          totalBloggers: res.totalBloggers ?? 0,
          totalViews: res.totalViews ?? 0,
          totalViewsMonth: res.totalViewsMonth ?? 0,
          totalViewsWeek: res.totalViewsWeek ?? 0,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load summary");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="row g-3 mb-4">
      <div className="col-6 col-md-3">
        <div className="card">
          <div className="card-body text-center py-3 d-flex flex-column align-items-center justify-content-center">
            <h6 className="mb-1">Total Blogs</h6>
            {loading ? (
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              />
            ) : (
              <div className="h4 mb-0">
                {Number(data.totalBlogs).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card">
          <div className="card-body text-center py-3 d-flex flex-column align-items-center justify-content-center">
            <h6 className="mb-1">Total Bloggers</h6>
            {loading ? (
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              />
            ) : (
              <div className="h4 mb-0">
                {Number(data.totalBloggers).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card">
          <div className="card-body text-center py-3 d-flex flex-column align-items-center justify-content-center">
            <h6 className="mb-1">Total Views</h6>
            {loading ? (
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              />
            ) : (
              <div className="h4 mb-0">
                {Number(data.totalViews).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card">
          <div className="card-body text-center py-3 d-flex flex-column align-items-center justify-content-center">
            <h6 className="mb-1">Total Views Per Week/Month</h6>
            {loading ? (
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              />
            ) : (
              <div className="h4 mb-0">
                {Number(data.totalViewsWeek).toLocaleString()} /
                {Number(data.totalViewsMonth).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
      {error && (
        <div className="col-12">
          <div className="alert alert-warning mb-0" role="alert">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
