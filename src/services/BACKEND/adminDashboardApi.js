import api from "../axios";

/* ===============================
   ADMIN: Get Dashboard Data
================================= */

export const getDashboardData = async () => {
  const res = await api.get("/dashboard/data");
  return res.data;
};
