import { supabase } from "../config/db.js";

export async function getAllActive() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("id", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAll() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsert(serviceData) {
  const { error } = await supabase.from("services").upsert([serviceData], {
    onConflict: "id",
  });
  if (error) throw error;
  return true;
}

export async function remove(id) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
  return true;
}



// `