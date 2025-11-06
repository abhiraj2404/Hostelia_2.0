import axios from "axios";

import type { InternalAxiosRequestConfig } from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ??
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api");

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
