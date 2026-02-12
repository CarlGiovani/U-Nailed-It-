import supabase from "../../utils/supabaseClient.js";

/* ==========================================
   PUBLIC: fetch active policies
========================================== */
export const fetchtActivePolicies = async (params) => {
  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) throw new Error();
  return data;
};

/* ==========================================
   ADMIN : fetch all policies
========================================== */
export const fetchAllPolicies = async (params) => {
  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error();
  return data;
};

/* ==========================================
   ADMIN : insert Policy
========================================== */
export const insertPolicy = async ({ title, content, is_active }) => {
  const { data, error } = await supabase
    .from("policies")
    .insert([{ title, content, is_active }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/* ==========================================
   ADMIN : update policty
========================================== */

export const updatePolicyById = async (id, payload) => {
  const { data, error } = await supabase
    .from("policies")
    .update({
      ...payload,
      updated_at: new Date(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error();
  return data;
};

/* ==========================================
   ADMIN : delete id policy
========================================== */
export const deletePolicyById = async (id) => {
  const { data, error } = await supabase.from("policies").delete().eq("id", id);

  if (error) throw new error();
};
