// config/axios.js - DITO NA BA ITO?
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL|| "http://localhost:5000/api", // TAMA ITO KUNG NASA PORT 5000 ANG BACKEND
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("❌ Response Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default api;
