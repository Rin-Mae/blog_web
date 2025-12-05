import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const cookies = document.cookie.split(";");
  const xsrfCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("XSRF-TOKEN=")
  );

  if (xsrfCookie) {
    const token = xsrfCookie.split("=")[1];
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
  }

  return config;
});

export default api;
