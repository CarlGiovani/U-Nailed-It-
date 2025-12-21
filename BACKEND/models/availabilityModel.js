import { supabase } from "../config/db.js";

export async function getSettings() {
  const { data, error } = await supabase
    .from("availability_settings")
    .select("*")
    .limit(1)
    .single();
  if (error) throw error;
  return data;
}

export async function getUnavailablePeriods(date) {
  const { data, error } = await supabase
    .from("unavailable_periods")
    .select("*")
    .gte("end_at", `${date}T00:00:00`)
    .lte("start_at", `${date}T23:59:59`);
  if (error) throw error;
  return data;
}
