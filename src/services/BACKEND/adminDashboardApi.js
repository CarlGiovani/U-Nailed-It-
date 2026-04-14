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
};

/* ===============================
   ADMIN: BLOCK CUSTOMER
================================= */
export const blockCustomer = async ({ email, reason }) => {
  const res = await api.patch("/dashboard/customers/block", {
    email,
    reason,
  });
  return res.data;
};

/* ===============================
   ADMIN: UNBLOCK CUSTOMER
================================= */
export const unblockCustomer = async ({ email }) => {
  const res = await api.patch("/dashboard/customers/unblock", {
    email,
  });
  return res.data;
};