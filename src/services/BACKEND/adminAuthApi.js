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

/* =========================
   GET EMAIL SETTINGS
========================= */
export const getEmailSettings = async () => {
  const res = await api.get("/email-settings");
  return res.data;
};

/* =========================
   UPDATE EMAIL SETTINGS
========================= */
export const updateEmailSettings = async ({
  sender_name,
  email_user,
  email_app_password,
}) => {
  const res = await api.put("/email-settings", {
    sender_name,
    email_user,
    email_app_password,
  });

  return res.data;
};

/* =========================
   TEST EMAIL SETTINGS
========================= */
export const testEmailSettings = async ({
  sender_name,
  email_user,
  email_app_password,
  test_to,
}) => {
  const res = await api.post("/email-settings/test", {
    sender_name,
    email_user,
    email_app_password,
    test_to,
  });

  return res.data;
};
