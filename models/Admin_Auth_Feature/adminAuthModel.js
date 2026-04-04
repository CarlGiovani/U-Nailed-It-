import supabase, { supabaseAdmin } from "../../utils/supabaseClient.js";

/* =========================
   CREATE ADMIN AUTH USER
========================= */
export const createAdminAuthUser = async ({
  email,
  password,
  username,
  full_name,
}) => {
  return await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username: username || null,
      full_name: full_name || null,
    },
  });
};

/* =========================
   UPSERT ADMIN PROFILE
========================= */
export const upsertAdminProfile = async ({
  id,
  email,
  username,
  full_name,
}) => {
  return await supabaseAdmin.from("admin_profiles").upsert({
    id,
    email,
    username: username || null,
    full_name: full_name || null,
    role: "admin",
  });
};

/* =========================
   DELETE AUTH USER
========================= */
export const deleteAdminAuthUser = async (userId) => {
  return await supabaseAdmin.auth.admin.deleteUser(userId);
};

/* =========================
   UPDATE ADMIN PASSWORD
========================= */
export const updateAdminPasswordById = async (userId, newPassword) => {
  return await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
};

/* =========================
   ADMIN LOGIN
========================= */
export const signInAdmin = async ({ email, password }) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

/* =========================
   FORGOT PASSWORD
========================= */
export const sendPasswordResetEmail = async ({ email, redirectTo }) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
};

/* =========================
   GET ADMIN PROFILE BY ID
========================= */
export const getAdminProfileById = async (userId) => {
  return await supabase
    .from("admin_profiles")
    .select("id, email, username, full_name, role, created_at")
    .eq("id", userId)
    .single();
};
