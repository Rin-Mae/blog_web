import api from "./api";

const PublicServices = {
  async getBlogs(page = 1, perPage = 12, search = "", sort = "published_desc") {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (search && search.trim()) params.append("search", search.trim());
    if (sort) params.append("sort", sort);
    const res = await api.get(`/public/blogs?${params.toString()}`);
    return res.data;
  },
  async getBlog(id) {
    const res = await api.get(`/public/blogs/${id}`);
    return res.data;
  },
  async getRandomBlogs(count = 3) {
    const res = await api.get(`/public/blogs/random/${count}`);
    return res.data;
  },
};

export default PublicServices;
