import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // TAMA ITO KUNG NASA PORT 5000 ANG BACKEND
  headers: {
    "Content-Type": "application/json",
  },
});
export default api;
