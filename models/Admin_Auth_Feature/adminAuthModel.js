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
  return await supabaseAdmin
    .from("admin_profiles")
    .select("id, email, username, full_name, role, created_at")
    .eq("id", userId)
    .maybeSingle();
};

/* =========================
   GET ALL ADMIN PROFILES
========================= */
export const getAllAdminProfiles = async () => {
  return await supabaseAdmin
    .from("admin_profiles")
    .select("id, email, username, full_name, role, created_at")
    .order("created_at", { ascending: false });
};

/* =========================
   UPDATE ADMIN PROFILE BY ID
========================= */
export const updateAdminProfileById = async (userId, updates) => {
  return await supabaseAdmin
    .from("admin_profiles")
    .update({
      full_name: updates.full_name || null,
      username: updates.username || null,
    })
    .eq("id", userId)
    .select()
    .single();
};

/* =========================
   DELETE ADMIN PROFILE BY ID
========================= */
export const deleteAdminProfileById = async (userId) => {
  return await supabaseAdmin.from("admin_profiles").delete().eq("id", userId);
};
