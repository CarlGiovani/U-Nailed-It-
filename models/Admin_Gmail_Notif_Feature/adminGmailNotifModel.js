import supabase from "../../utils/supabaseClient.js";

export const getSingleAdmin = async () => {
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("id, email, username, full_name, role")
    .eq("role", "admin")
    .limit(1)
    .single();

  if (error) {
    throw new Error(`Failed to fetch admin profile: ${error.message}`);
  }

  return data;
};
