// src/lib/axiosInstance.js

import axios from "axios";

// Create instance with base URL
const axiosInstance = axios.create({
  baseURL:  process.env.REACT_APP_API_BASE_URL||'http://localhost:5000/api',
  withCredentials: true, // Sends httpOnly refresh cookies
});

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
