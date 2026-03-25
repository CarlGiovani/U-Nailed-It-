import supabase from "../../utils/supabaseClient.js";

// CREATE
export const createPortfolio = async (payload) => {
  const { data, error } = await supabase
    .from("portfolio")
    .insert([payload])
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

// READ ALL
export const getAllPortfolio = async () => {
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// READ BY ID
export const getPortfolioById = async (id) => {
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// UPDATE
export const updatePortfolio = async (id, payload) => {
  const { data, error } = await supabase
    .from("portfolio")
    .update(payload)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};

// DELETE
export const deletePortfolio = async (id) => {
  const { error } = await supabase.from("portfolio").delete().eq("id", id);

  if (error) throw error;
};
