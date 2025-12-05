import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import AdminServices from "../../services/AdminServices";

export default function TrafficTrends() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trafficOverTime, setTrafficOverTime] = useState([]);
  const [blogsPerMonth, setBlogsPerMonth] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await AdminServices.getDashboardTrends();
        setTrafficOverTime(res.trafficOverTime || []);
        setBlogsPerMonth(res.blogsPerMonth || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load trends");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  return (
    <div className="row g-4 mb-4">
      <div className="col-12 col-lg-8">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title">Monthly Views (Last 12 Months)</h5>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trafficOverTime}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#223D7B"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {loading && (
                <div className="text-center mt-2">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-4">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title">New Blogs Per Month</h5>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={blogsPerMonth}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="newBlogs" fill="#F1A043" />
                </BarChart>
              </ResponsiveContainer>
              {loading && (
                <div className="text-center mt-2">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  />
                </div>
              )}
            </div>
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
