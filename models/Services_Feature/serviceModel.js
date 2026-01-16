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

// helper function para i-upload image sa Supabase bucket
const uploadServiceImage = async (file) => {
  if (!file) return null;

  const fileName = `services/${Date.now()}-${file.originalname}`;

  // Upload
  const { data, error } = await supabase.storage
    .from("services-images")
    .upload(fileName, file.buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.mimetype,
    });

  if (error) throw new Error(error.message);

  // Debugging
  console.log("UPLOAD DATA:", data);

  // Dito, siguraduhin may path
  if (!data || !data.path)
    throw new Error("Upload succeeded pero walang path.");

  // Kunin public URL
  const { data: publicData, error: publicError } = supabase.storage
    .from("services-images")
    .getPublicUrl(data.path);

  if (publicError) throw new Error(publicError.message);

  // Debugging
  console.log("PUBLIC URL:", publicData.publicUrl);

  return publicData.publicUrl;
};

// CREATE new service with optional image
export const createService = async ({ file, ...service }) => {
  let imageUrl = null;

  if (file) {
    imageUrl = await uploadServiceImage(file);
  }

  const { data, error } = await supabase
    .from("services")
    .insert([{ ...service, image_url: imageUrl }])
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

// UPDATE service
export const updateService = async (id, { file, ...service }) => {
  let imageUrl = null;

  // Kung may bagong file, i-upload sa Supabase
  if (file) {
    imageUrl = await uploadServiceImage(file);
  }

  const updatedData = {
    ...service,
    ...(imageUrl && { image_url: imageUrl }), // palitan lang ang image_url kung may bagong file
    updated_at: new Date(), // automatic update ng timestamp
  };

  const { data, error } = await supabase
    .from("services")
    .update(updatedData)
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


// REACTIVATE service
export const reactivateService = async (id) => {
  const { data, error } = await supabase
    .from("services")
    .update({ is_active: true, updated_at: new Date() })
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Service not found");

  return data[0];
};
