import api from "../axios";

/* ===============================
   ADMIN: GET AUDIT LOGS
=============================== */

export const getAuditLogs = async () => {
  const res = await api.get("/audit/logs");
  return res.data;
};
