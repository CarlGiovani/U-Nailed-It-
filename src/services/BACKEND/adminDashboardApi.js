import api from "../axios";

/* ===============================
   ADMIN: Get Dashboard Data
================================= */
export const getDashboardData = async () => {
  const res = await api.get("/dashboard/data");
  return res.data;
};

/* ===============================
   ADMIN: Get export data
================================= */
export const getSystemExportData = async () => {
  const res = await api.get("/dashboard/export");
  return res.data;
}
