import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ==============================
   REQUEST INTERCEPTOR
============================== */
api.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem("admin_session");

    if (session) {
      try {
        const parsed = JSON.parse(session);

        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${parsed.access_token}`,
        };
      } catch {
        console.error("Invalid session format");
        localStorage.removeItem("admin_session");
      }
    }

    console.log(
      `📡 API Request: ${config.method?.toUpperCase()} ${config.url}`,
    );

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  },
);

/* ==============================
   RESPONSE INTERCEPTOR
============================== */
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ Response Error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      localStorage.removeItem("admin_session");
      localStorage.removeItem("admin_user");
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default api;
