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
export const blockCustomer = async ({ email, name, reason, cancelCount }) => {
  const res = await api.patch("/dashboard/customers/block", {
    email,
    name,
    reason,
    cancelCount,
  });
  return res.data;
};

/* ===============================
   ADMIN: UNBLOCK CUSTOMER
================================= */
export const unblockCustomer = async ({ customer_id }) => {
  const res = await api.patch("/dashboard/customers/unblock", {
    customer_id,
  });
  return res.data;
};


/* =====================================
   ADMIN: BOOKING SNAPSHOT (TODAY + UPCOMING)
===================================== */
export const getBookingSnapshot = async () => {
  const res = await api.get("/dashboard/bookings/snapshot");
  return res.data;
};