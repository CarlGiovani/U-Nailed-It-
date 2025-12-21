import { supabase } from "../config/db.js";


export async function createCustomer({name, address, phone, facebook}){
  const {data, error} = await supabase
    .from("customers")
    .insert([{name, address, phone, facebook}])
    .select()
    .single();
  if (error) throw error;
  return data;
}