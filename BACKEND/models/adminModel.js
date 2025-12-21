import { supabase } from "../config/db.js"; 

export async function findByUsername(username) {
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("username", username)
    .limit(1);
  if (error) throw error;
  return data[0];
}

export async function createAdmin({ username, password_hash, role }) {
  const { data, error } = await supabase
    .from("admins")
    .insert([{ username, password_hash, role }])
    .select();
  if (error) throw error;
  return data[0];
}
