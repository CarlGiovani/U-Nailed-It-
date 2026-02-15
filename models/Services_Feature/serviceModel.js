import supabase from "../../utils/supabaseClient.js";

// GET ALL SERVICES (public)
export const getAllServices = async () => {
  const { data, error } = await supabase
    .from("services")
    .select(
      `
      *,
      service_categories (
        id,
        name,
        service_variants (
          id,
          body_part,
          size,
          price,
          downpayment
        )
      )
    `,
    )
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// GET SINGLE SERVICE BY ID (public)
export const getServiceById = async (id) => {
  const { data, error } = await supabase
    .from("services")
    .select(
      `
      *,
      service_categories (
        id,
        name,
        service_variants (
          id,
          body_part,
          size,
          price,
          downpayment
        )
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// ADMIN : Admin service fetch
// ADMIN: get all services (including inactive)
export const getAllServicesAdmin = async () => {
  const { data, error } = await supabase
    .from("services")
    .select(
      `
      id,
      name,
      description,
      duration,
      image_url,
      is_active,
      created_at,
      updated_at,
      service_categories (
        id,
        name,
        is_active,
        service_variants (
          id,
          body_part,
          size,
          price,
          downpayment,
          is_active
        )
      )
    `,
    )
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// ADMIN:  CREATE new service

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

  // Kunin public URL
  const { data: publicData, error: publicError } = await supabase.storage
    .from("services-images")
    .getPublicUrl(data.path);

  if (publicError) throw new Error(publicError.message);

  return publicData.publicUrl;
};

// CREATE new service with optional image
export const createService = async ({ file, ...service }) => {
  const imageUrl = file ? await uploadServiceImage(file) : null;

  const { data, error } = await supabase
    .from("services")
    .insert([{ ...service, image_url: imageUrl }])
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

// UPDATE service
export const updateService = async (id, { file, ...service }) => {
  const imageUrl = file ? await uploadServiceImage(file) : null;

  const updatedData = {
    ...service,
    ...(imageUrl && { image_url: imageUrl }),
    updated_at: new Date(),
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
    .update({ is_active: false, updated_at: new Date() })
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

// SERVICE CATEGORIES
export const createCategory = async (service_id, name) => {
  const { data, error } = await supabase
    .from("service_categories")
    .insert([{ service_id, name, is_active: true }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// UPDATE category
export const updateCategory = async (id, name) => {
  const { data, error } = await supabase
    .from("service_categories")
    .update({ name, updated_at: new Date() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// DELETE / Deactivate category (soft delete)
export const deleteCategory = async (id) => {
  const { data, error } = await supabase
    .from("service_categories")
    .update({ is_active: false, updated_at: new Date() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// VARIANTS OF THE SERVICES
export const createVariant = async (variant) => {
  const { data, error } = await supabase
    .from("service_variants")
    .insert([variant])
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// UPDATE variant
export const updateVariant = async (id, variant) => {
  const { data, error } = await supabase
    .from("service_variants")
    .update({ ...variant, updated_at: new Date() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// DELETE / deactivate variant
export const deleteVariant = async (id) => {
  const { data, error } = await supabase
    .from("service_variants")
    .update({ is_active: false, updated_at: new Date() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};
