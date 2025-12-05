import React from "react";
import BloggerHeader from "../../components/bloggerlayout/BloggerHeader";
import BloggerFooter from "../../components/bloggerlayout/BloggerFooter";
import Sidebar from "../../components/bloggerlayout/Sidebar";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

function Dashboard() {
  const postsData = [
    { month: "Jan", posts: 2 },
    { month: "Feb", posts: 3 },
    { month: "Mar", posts: 5 },
    { month: "Apr", posts: 4 },
    { month: "May", posts: 6 },
    { month: "Jun", posts: 7 },
  ];

  const wordsData = [
    { month: "Jan", words: 1200 },
    { month: "Feb", words: 2100 },
    { month: "Mar", words: 3300 },
    { month: "Apr", words: 2800 },
    { month: "May", words: 4200 },
    { month: "Jun", words: 5000 },
  ];

  return (
    <div className={`blogger-layout sidebar-open`}>
      <BloggerHeader />

      <div className="d-flex">
        <Sidebar />

        <main className="blogger-main flex-fill p-4">
          <div className="container-fluid">
            <div className="mb-3">
              <h1>Dashboard</h1>
              <p className="text-muted">
                Overview of your writing progress, reach, and recent activity.
              </p>
            </div>

            {/* Row 1 — Writing & Content Progress */}
            <section className="mb-4">
              <div className="row g-3">
                <div className="col-sm-6 col-md-3">
                  <div className="card p-3 h-100">
                    <div className="small text-muted">Drafts Count</div>
                    <div className="h4 mt-2">0</div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card p-3 h-100">
                    <div className="small text-muted">
                      Published Posts Count
                    </div>
                    <div className="h4 mt-2">0</div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card p-3 h-100">
                    <div className="small text-muted">
                      Words Written This Week
                    </div>
                    <div className="h4 mt-2">0</div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="card p-3 h-100">
                    <div className="small text-muted">
                      Active Writing Streak (days)
                    </div>
                    <div className="h4 mt-2">0</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Row 2 — Engagement & Reach */}
            <section className="mb-4">
              <div className="row g-3">
                <div className="col-sm-6 col-md-4">
                  <div className="card p-3 h-100">
                    <div className="small text-muted">Total Views</div>
                    <div className="h4 mt-2">0</div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-4">
                  <div className="card p-3 h-100">
                    <div className="small text-muted">
                      Total Comments Received
                    </div>
                    <div className="h4 mt-2">0</div>
                  </div>
                </div>
                <div className="col-sm-12 col-md-4">
                  <div className="card p-3 h-100">
                    <div className="small text-muted">
                      Average Read Time of Your Posts
                    </div>
                    <div className="h4 mt-2">0 min</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Row 3 — Performance Insights (tables) */}
            <section className="mb-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card p-3">
                    <h5>Top 5 Most Read Posts</h5>
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
                          <tr>
                            <td>—</td>
                            <td className="text-muted">No posts yet</td>
                            <td>—</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card p-3">
                    <h5>Top 5 Most Commented Posts</h5>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Comments</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>—</td>
                            <td className="text-muted">No posts yet</td>
                            <td>—</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Row 4 — Writing Activity (charts placeholders) */}
            <section className="mb-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card p-3">
                    <h5>Posts Published Over Time</h5>
                    <div style={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={postsData}
                          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="posts"
                            stroke="#1976d2"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card p-3">
                    <h5>Words Written Per Month</h5>
                    <div style={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={wordsData}
                          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="words" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <BloggerFooter />
    </div>
  );
}

export default Dashboard;
