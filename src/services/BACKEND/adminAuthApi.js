import api from "../axios";

/* ===============================
   ADMIN LOGIN
=============================== */
export const adminAuthLogin = async ({ email, password }) => {
  const res = await api.post("/auth/login", {
    email,
    password,
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
export const createAdminAccount = async ({ email, password }) => {
  const res = await api.post("/auth/create-account", {
    email,
    password,
  });
  return res.data;
};
