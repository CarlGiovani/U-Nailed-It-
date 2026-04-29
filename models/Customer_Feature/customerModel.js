import { supabaseAdmin } from "../../utils/supabaseClient.js";

// CREATE or GET customer by email
export const getOrCreateCustomer = async ({
  full_name,
  email,
  phone,
  facebook_link,
}) => {
  // Check if customer exists
  let { data: existing, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error && !existing) throw new Error(error.message);

  if (existing) return existing;

  // If not exists, create new
  const { data, error: insertError } = await supabaseAdmin
    .from("customers")
    .insert([{ full_name, email, phone, facebook_link }])
    .select();

  if (insertError) throw new Error(insertError.message);

  return data[0];
};

// GET customer by email
export const getCustomerByEmail = async (email) => {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("email", email)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// GET customer by ID
export const getCustomerById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// GET all customers (for admin)
export const getAllCustomers = async () => {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};
