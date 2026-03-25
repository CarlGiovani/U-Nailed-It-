// config/axios.js - DITO NA BA ITO?
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.100.5:5000/api", // TAMA ITO KUNG NASA PORT 5000 ANG BACKEND
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method.toUpperCase()} ${config.url}`);
    console.log("📦 Request Data:", config.data);
    console.log("🔍 Request Params:", config.params);
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
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log("📦 Response Data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ Response Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default api;
