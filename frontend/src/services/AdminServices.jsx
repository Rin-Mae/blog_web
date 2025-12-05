import api from "./api";
import AuthServices from "./AuthServices";

const getUsers = async (page = 1, search = "") => {
  const params = new URLSearchParams({ page });
  if (search) params.append("search", search);
  const res = await api.get(`/admin/users?${params.toString()}`);
  return res.data;
};

const getUser = async (id) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

const updateUser = async (id, userData) => {
  await AuthServices.getCsrfToken();
  const res = await api.put(`/admin/users/${id}`, userData);
  return res.data;
};

const deleteUser = async (id) => {
  await AuthServices.getCsrfToken();
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

const updateUserStatus = async (id, status) => {
  await AuthServices.getCsrfToken();
  const res = await api.patch(`/admin/users/status/${id}`, { status });
  return res.data;
};

const getPosts = async (
  page = 0,
  perPage = 12,
  search = "",
  sort = "published_desc"
) => {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (search && search.trim()) params.append("search", search.trim());
  if (sort) params.append("sort", sort);
  const res = await api.get(`/admin/posts?${params.toString()}`);
  return res.data;
};

const getPost = async (id) => {
  const res = await api.get(`/admin/posts/${id}`);
  return res.data;
};

const deletePost = async (id) => {
  await AuthServices.getCsrfToken();
  const res = await api.delete(`/admin/posts/${id}`);
  return res.data;
};

const getProfile = async () => {
  const res = await api.get("/admin/profile");
  return res.data;
};

const updateProfile = async (profileData) => {
  await AuthServices.getCsrfToken();
  if (profileData instanceof FormData) {
    if (!profileData.has("_method")) {
      profileData.append("_method", "PATCH");
    }
    const res = await api.post("/admin/profile", profileData);
    return res.data;
  }
  const res = await api.patch("/admin/profile", profileData);
  return res.data;
};

const getDashboardSummary = async () => {
  const res = await api.get("/admin/dashboard/summary");
  return res.data;
};

const getDashboardTrends = async () => {
  const res = await api.get("/admin/dashboard/trends");
  return res.data;
};

const getDashboardLeaderboards = async () => {
  const res = await api.get("/admin/dashboard/leaderboards");
  return res.data;
};

const getDashboardActivity = async (page = 1, perPage = 10) => {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });
  const res = await api.get(`/admin/dashboard/activity?${params.toString()}`);
  return res.data; // { recentBlogs, pagination }
};

export default {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getPosts,
  getPost,
  deletePost,
  getProfile,
  updateProfile,
  getDashboardSummary,
  getDashboardTrends,
  getDashboardLeaderboards,
  getDashboardActivity,
};
