import axios from "axios";
import api from "./api";

const SANCTUM_API_URL = import.meta.env.VITE_SANCTUM_URL;

const getCsrfToken = () => {
  const cookies = document.cookie.split(";");
  const hasXsrfToken = cookies.some((cookie) =>
    cookie.trim().startsWith("XSRF-TOKEN=")
  );

  if (!hasXsrfToken) {
    return axios.get(SANCTUM_API_URL, { withCredentials: true });
  }
  return Promise.resolve();
};

const getUser = async () => {
  const res = await api.get("/user");
  return res.data;
};

const login = async (credentials) => {
  await getCsrfToken();

  const res = await api.post("/login", credentials);
  return res.data;
};

const logout = async () => {
  await getCsrfToken();

  const res = await api.post("/logout");
  return res.data;
};

const register = async (userData) => {
  await getCsrfToken();

  const res = await api.post("/register", userData);
  return res.data;
};

export default { getCsrfToken, getUser, login, logout, register };
