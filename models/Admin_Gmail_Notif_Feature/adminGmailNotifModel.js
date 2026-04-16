import { supabaseAdmin } from "../../utils/supabaseClient.js";

export const getAllAdmins = async () => {
  const { data, error } = await supabaseAdmin
    .from("admin_profiles")
    .select("id, email, username, full_name, role")
    .eq("role", "admin");

  if (error) {
    throw new Error(`Failed to fetch admin profiles: ${error.message}`);
  }

  return data || [];
};
