import api from "./api";
import AuthServices from "./AuthServices";

const getMostViewedBlogs = async () => {
  await AuthServices.getCsrfToken();
  const res = await api.get("/blogger/most-viewed-blogs");
  return res.data;
};

const getMyBlogs = async () => {
  await AuthServices.getCsrfToken();
  const res = await api.get("/blogger/blogs");
  return res.data;
};

const createBlog = async (formData) => {
  await AuthServices.getCsrfToken();
  const res = await api.post("/blogger/blogs", formData);
  return res.data;
};

const getBlogDetails = async (id) => {
  await AuthServices.getCsrfToken();
  const res = await api.get(`/blogger/blogs/${id}`);
  return res.data;
};

const updateBlog = async (id, formData) => {
  await AuthServices.getCsrfToken();
  if (formData && typeof formData.append === "function") {
    try {
      formData.delete("_method");
    } catch {}
    formData.append("_method", "PATCH");
  }
  const res = await api.post(`/blogger/blogs/${id}`, formData);
  return res.data;
};

const deleteBlog = async (id) => {
  await AuthServices.getCsrfToken();
  const res = await api.delete(`/blogger/blogs/${id}`);
  return res.data;
};

const getProfile = async () => {
  await AuthServices.getCsrfToken();
  const res = await api.get("/blogger/profile");
  return res.data;
};

const updateProfile = async (formData) => {
  await AuthServices.getCsrfToken();
  if (formData && typeof formData.append === "function") {
    try {
      formData.delete("_method");
    } catch {}
    formData.append("_method", "PATCH");
    const res = await api.post(`/blogger/profile`, formData);
    return res.data;
  }

  const res = await api.patch(`/blogger/profile`, formData);
  return res.data;
};

const updateAccount = async (id, action) => {
  await AuthServices.getCsrfToken();
  const res = await api.patch(`/blogger/profile/settings/${id}`, { action });
  return res.data;
};

export default {
  getMostViewedBlogs,
  getMyBlogs,
  createBlog,
  getBlogDetails,
  updateBlog,
  deleteBlog,
  getProfile,
  updateProfile,
  updateAccount,
};
