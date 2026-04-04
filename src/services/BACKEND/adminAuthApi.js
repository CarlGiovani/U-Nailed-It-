import api from "../axios";

/* ===============================
   ADMIN LOGIN
=============================== */
export const adminAuthLogin = async ({
  email,
  password,
  username,
  full_name,
}) => {
  const res = await api.post("/auth/login", {
    email,
    password,
    username,
    full_name,
  });

  return res.data;
};

/* ===============================
   FORGOT PASSWORD
=============================== */
export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

/* ===============================
   ADMIN LOGOUT
=============================== */
export const adminLogout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

/* ===============================
   CHANGE PASSWORD
=============================== */
export const changePassword = async ({ newPassword, confirmPassword }) => {
  const res = await api.post("/auth/change-password", {
    newPassword,
    confirmPassword,
  });
  return res.data;
};

/* ===============================
   CREATE NEW ADMIN ACCOUNT
=============================== */
export const createAdminAccount = async ({
  full_name,
  username,
  email,
  password,
}) => {
  const res = await api.post("/auth/create-account", {
    full_name,
    username,
    email,
    password,
  });

  return res.data;
};

/* =========================
   getAdminProfileById
========================= */
export const getAdminProfileById = async () => {
  const res = await api.get("/auth/adminProfile");
  return res.data;
};

/* =========================
   GET ALL ADMINS
========================= */
export const getAllAdmins = async () => {
  const res = await api.get("/auth/admins");
  return res.data;
};

/* =========================
   UPDATE CURRENT ADMIN PROFILE
========================= */
export const updateCurrentAdminProfile = async ({ full_name, username }) => {
  const res = await api.put("/auth/adminProfile", {
    full_name,
    username,
  });
  return res.data;
};

/* =========================
   DELETE CURRENT ADMIN ACCOUNT
========================= */
export const deleteCurrentAdminAccount = async () => {
  const res = await api.delete("/auth/adminProfile");
  return res.data;
};
