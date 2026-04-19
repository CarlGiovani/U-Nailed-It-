import supabase from "../../utils/supabaseClient.js";
const normalizeVariantPayload = (variant = {}) => {
  const normalized = {
    ...variant,
    body_part: variant.body_part?.trim?.() || "",
    size: variant.size?.trim?.() || "",
    price:
      variant.price === "" ||
      variant.price === null ||
      variant.price === undefined
        ? null
        : Number(variant.price),
    downpayment:
      variant.downpayment === "" ||
      variant.downpayment === null ||
      variant.downpayment === undefined
        ? null
        : Number(variant.downpayment),
    estimate_min:
      variant.estimate_min === "" ||
      variant.estimate_min === null ||
      variant.estimate_min === undefined
        ? null
        : Number(variant.estimate_min),
    estimate_max:
      variant.estimate_max === "" ||
      variant.estimate_max === null ||
      variant.estimate_max === undefined
        ? null
        : Number(variant.estimate_max),
  };

  if (normalized.price !== null && Number.isNaN(normalized.price)) {
    throw new Error("Price must be a valid number");
  }

  if (normalized.downpayment !== null && Number.isNaN(normalized.downpayment)) {
    throw new Error("Downpayment must be a valid number");
  }

  if (
    normalized.estimate_min !== null &&
    Number.isNaN(normalized.estimate_min)
  ) {
    throw new Error("Estimate min must be a valid number");
  }

  if (
    normalized.estimate_max !== null &&
    Number.isNaN(normalized.estimate_max)
  ) {
    throw new Error("Estimate max must be a valid number");
  }

  if (normalized.price !== null && normalized.price < 0) {
    throw new Error("Price cannot be negative");
  }

  if (normalized.downpayment !== null && normalized.downpayment < 0) {
    throw new Error("Downpayment cannot be negative");
  }

  if (normalized.estimate_min !== null && normalized.estimate_min < 0) {
    throw new Error("Estimate min cannot be negative");
  }

  if (normalized.estimate_max !== null && normalized.estimate_max < 0) {
    throw new Error("Estimate max cannot be negative");
  }

  if (
    normalized.estimate_min !== null &&
    normalized.estimate_max !== null &&
    normalized.estimate_min > normalized.estimate_max
  ) {
    throw new Error("Estimate min cannot be greater than estimate max");
  }

  return normalized;
};
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
          downpayment,
          estimate_min,
          estimate_max
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
          downpayment,
          estimate_min,
          estimate_max
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
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select(
      `
      *,
      service_categories(
        *,
        service_variants(*)
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (servicesError) throw new Error(servicesError.message);

  const { data: activeBookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("service_id")
    .in("status", ["pending_payment", "pending_approval", "approved"]);

  if (bookingsError) throw new Error(bookingsError.message);

  const bookedServiceIds = new Set(
    (activeBookings || []).map((booking) => booking.service_id).filter(Boolean),
  );

  const enrichedServices = (services || []).map((service) => ({
    ...service,
    hasBookings: bookedServiceIds.has(service.id),
  }));

  return enrichedServices;
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
  const normalizedVariant = normalizeVariantPayload(variant);

  const { data, error } = await supabase
    .from("service_variants")
    .insert([normalizedVariant])
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

// UPDATE variant
export const updateVariant = async (id, variant) => {
  const normalizedVariant = normalizeVariantPayload(variant);

  const { data, error } = await supabase
    .from("service_variants")
    .update({ ...normalizedVariant, updated_at: new Date() })
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
