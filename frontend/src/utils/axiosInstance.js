// axiosInstance.js
import axios from "axios";
export const API_TOKEN_KEY = "@Token:";

const baseUrl = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(API_TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    new Promise((_, reject) => {
      if (error.response && error.response.status === 401) {
        const pathname = window.location.pathname;
        if (pathname !== "/login") window.location.href = "/login";
        localStorage.removeItem(API_TOKEN_KEY);
      }
      reject(error);
    })
);

export default axiosInstance;
