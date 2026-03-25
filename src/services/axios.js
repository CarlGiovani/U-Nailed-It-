import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.100.5:5000/api",
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
      const parsed = JSON.parse(session);
      config.headers.Authorization = `Bearer ${parsed.access_token}`;
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

    // auto logout if unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_session");
      localStorage.removeItem("admin_user");
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default api;
