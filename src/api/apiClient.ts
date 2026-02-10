// apiClient.ts
import axios from "axios";

const token = localStorage.getItem("token");

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
});

// Optional: dynamically attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
