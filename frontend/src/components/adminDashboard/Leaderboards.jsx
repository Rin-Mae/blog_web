import React, { useEffect, useState } from "react";
import AdminServices from "../../services/AdminServices";

export default function Leaderboards() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topBlogs, setTopBlogs] = useState([]);
  const [topBloggers, setTopBloggers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await AdminServices.getDashboardLeaderboards();
        setTopBlogs(res.topBlogs || []);
        setTopBloggers(res.topBloggers || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load leaderboards");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="row g-4 mb-4">
      <div className="col-12 col-md-6">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Top 5 Viewed Blogs</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="text-center">
                        <div
                          className="spinner-border spinner-border-sm text-primary"
                          role="status"
                        />
                      </td>
                    </tr>
                  ) : (
                    topBlogs.map((b, idx) => (
                      <tr key={b.id}>
                        <td>{idx + 1}</td>
                        <td>{b.title}</td>
                        <td>{b.views.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {error && (
                <div className="alert alert-warning mb-0" role="alert">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Top Bloggers by Views</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Blogger</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="text-center">
                        <div
                          className="spinner-border spinner-border-sm text-primary"
                          role="status"
                        />
                      </td>
                    </tr>
                  ) : (
                    topBloggers.map((b, idx) => (
                      <tr key={b.id}>
                        <td>{idx + 1}</td>
                        <td>{b.name}</td>
                        <td>{b.views.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
