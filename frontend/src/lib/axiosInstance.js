// src/lib/axiosInstance.js

import axios from "axios";

// Create instance with base URL
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Vite uses import.meta.env
  withCredentials: true, // Sends httpOnly refresh cookies
})

// Attach token to headers if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
