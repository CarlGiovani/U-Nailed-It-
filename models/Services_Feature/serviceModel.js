import supabase, { supabaseAdmin } from "../../utils/supabaseClient.js";

const normalizeVariantPayload = (variant = {}) => {
  const normalized = {
    ...variant,
    body_part: variant.body_part?.trim?.() || "",
    size: variant.size?.trim?.() || "",
    price:
      variant.price === "" || variant.price === null || variant.price === undefined
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

  if (normalized.estimate_min !== null && Number.isNaN(normalized.estimate_min)) {
    throw new Error("Estimate min must be a valid number");
  }

  if (normalized.estimate_max !== null && Number.isNaN(normalized.estimate_max)) {
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

// ===============================
// HELPERS
// ===============================
const SERVICE_IMAGE_BUCKET = "services-images";

const normalizeImageArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return value ? [value] : [];
    }
  }

  return [];
};

const uploadServiceImage = async (file) => {
  if (!file) return null;

  const safeOriginalName = file.originalname.replace(/\s+/g, "_");
  const fileName = `services/${Date.now()}-${safeOriginalName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(SERVICE_IMAGE_BUCKET)
    .upload(fileName, file.buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.mimetype,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicData } = supabaseAdmin.storage
    .from(SERVICE_IMAGE_BUCKET)
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: publicData.publicUrl,
  };
};

const uploadServiceImages = async (files = []) => {
  if (!Array.isArray(files) || files.length === 0) return [];

  const uploadedUrls = [];

  for (const file of files) {
    const uploaded = await uploadServiceImage(file);
    if (uploaded?.publicUrl) {
      uploadedUrls.push(uploaded.publicUrl);
    }
  }

  return uploadedUrls;
};

const extractStoragePathFromPublicUrl = (publicUrl) => {
  if (!publicUrl || typeof publicUrl !== "string") return null;

  const marker = `/storage/v1/object/public/${SERVICE_IMAGE_BUCKET}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) return null;

  return publicUrl.substring(index + marker.length) || null;
};

const deleteServiceImagesByUrls = async (imageUrls = []) => {
  const filePaths = imageUrls
    .map(extractStoragePathFromPublicUrl)
    .filter(Boolean);

  if (filePaths.length === 0) return false;

  const { error } = await supabaseAdmin.storage
    .from(SERVICE_IMAGE_BUCKET)
    .remove(filePaths);

  if (error) {
    console.error("[SERVICE IMAGES] Delete failed:", error);
    return false;
  }

  return true;
};

const deleteServiceImageByUrl = async (publicUrl) => {
  if (!publicUrl) return false;
  return deleteServiceImagesByUrls([publicUrl]);
};

// ===============================
// GET ALL SERVICES PUBLIC
// ===============================
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

// ===============================
// GET SINGLE SERVICE PUBLIC
// ===============================
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

// ===============================
// ADMIN: GET ALL SERVICES
// ===============================
export const getAllServicesAdmin = async () => {
  const { data: services, error: servicesError } = await supabaseAdmin
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

  const { data: activeBookings, error: bookingsError } = await supabaseAdmin
    .from("bookings")
    .select("service_id")
    .in("status", ["pending_payment", "pending_approval", "approved"]);

  if (bookingsError) throw new Error(bookingsError.message);

  const bookedServiceIds = new Set(
    (activeBookings || []).map((booking) => booking.service_id).filter(Boolean),
  );

  return (services || []).map((service) => ({
    ...service,
    images: normalizeImageArray(service.images),
    hasBookings: bookedServiceIds.has(service.id),
  }));
};

// ===============================
// ADMIN: CREATE SERVICE
// ===============================
export const createService = async ({ file, galleryImages = [], images, ...service }) => {
  let imageUrl = null;

  if (file) {
    const uploadedImage = await uploadServiceImage(file);
    imageUrl = uploadedImage.publicUrl;
  }

  const uploadedGalleryImages = await uploadServiceImages(galleryImages);
  const existingImages = normalizeImageArray(images);

  const finalImages = [...existingImages, ...uploadedGalleryImages];

  const { data, error } = await supabaseAdmin
    .from("services")
    .insert([
      {
        ...service,
        image_url: imageUrl,
        images: finalImages,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// ===============================
// ADMIN: UPDATE SERVICE
// ===============================
export const updateService = async (
  id,
  { file, galleryImages = [], images, ...service },
) => {
  const { data: existingService, error: existingError } = await supabaseAdmin
    .from("services")
    .select("id, name, image_url, images")
    .eq("id", id)
    .single();

  if (existingError) throw new Error(existingError.message);
  if (!existingService) throw new Error("Service not found");

  const oldCoverImage = existingService.image_url;
  const oldImages = normalizeImageArray(existingService.images);
  const keptImages = images !== undefined ? normalizeImageArray(images) : oldImages;

  let newImageUrl = null;

  if (file) {
    const uploadedImage = await uploadServiceImage(file);
    newImageUrl = uploadedImage.publicUrl;
  }

  const uploadedGalleryImages = await uploadServiceImages(galleryImages);
  const finalImages = [...keptImages, ...uploadedGalleryImages];

  const updatedData = {
    ...service,
    ...(newImageUrl ? { image_url: newImageUrl } : {}),
    images: finalImages,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedRow, error: updateError } = await supabaseAdmin
    .from("services")
    .update(updatedData)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (updateError) throw new Error(updateError.message);

  const finalService =
    updatedRow ||
    (
      await supabaseAdmin
        .from("services")
        .select("*")
        .eq("id", id)
        .single()
    ).data;

  if (newImageUrl && oldCoverImage) {
    await deleteServiceImageByUrl(oldCoverImage);
  }

  const removedGalleryImages = oldImages.filter(
    (oldUrl) => !finalImages.includes(oldUrl),
  );

  if (removedGalleryImages.length > 0) {
    await deleteServiceImagesByUrls(removedGalleryImages);
  }

  return finalService;
};

// ===============================
// DELETE / DEACTIVATE SERVICE
// ===============================
export const deleteService = async (id) => {
  const { data, error } = await supabaseAdmin
    .from("services")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Service not found");

  return data;
};

// ===============================
// REACTIVATE SERVICE
// ===============================
export const reactivateService = async (id) => {
  const { data, error } = await supabaseAdmin
    .from("services")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Service not found");

  return data;
};

// ===============================
// SERVICE CATEGORIES
// ===============================
export const createCategory = async (service_id, name) => {
  const { data, error } = await supabaseAdmin
    .from("service_categories")
    .insert([{ service_id, name, is_active: true }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateCategory = async (id, name) => {
  const { data, error } = await supabaseAdmin
    .from("service_categories")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteCategory = async (id) => {
  const { data, error } = await supabaseAdmin
    .from("service_categories")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// ===============================
// VARIANTS
// ===============================
export const createVariant = async (variant) => {
  const normalizedVariant = normalizeVariantPayload(variant);

  const { data, error } = await supabaseAdmin
    .from("service_variants")
    .insert([normalizedVariant])
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export const updateVariant = async (id, variant) => {
  const normalizedVariant = normalizeVariantPayload(variant);

  const { data, error } = await supabaseAdmin
    .from("service_variants")
    .update({ ...normalizedVariant, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteVariant = async (id) => {
  const { data, error } = await supabaseAdmin
    .from("service_variants")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};