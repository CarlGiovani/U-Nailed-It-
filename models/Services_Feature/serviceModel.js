import supabase from "../../utils/supabaseClient.js";

// GET all active services
export const getAllServices = async () => {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return data;
};

// GET single service by ID
export const getServiceById = async (id) => {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// CREATE new service
export const createService = async (service) => {
  const { data, error } = await supabase
    .from("services")
    .insert([service])
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

// UPDATE service
export const updateService = async (id, service) => {
  const { data, error } = await supabase
    .from("services")
    .update(service)
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Service not found");
  return data[0];
};

// DELETE / Deactivate service
export const deleteService = async (id) => {
  const { data, error } = await supabase
    .from("services")
    .update({ is_active: false })
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Service not found");
  return data[0];
};
