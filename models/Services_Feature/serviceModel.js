import supabase, { supabaseAdmin } from "../../utils/supabaseClient.js";

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

// ===============================
// HELPERS
// ===============================
const SERVICE_IMAGE_BUCKET = "services-images";

const uploadServiceImage = async (file) => {
  if (!file) return null;

  const safeOriginalName = file.originalname.replace(/\s+/g, "_");
  const fileName = `services/${Date.now()}-${safeOriginalName}`;

  console.log("[SERVICE IMAGE] Uploading new image:", {
    bucket: SERVICE_IMAGE_BUCKET,
    fileName,
    mimeType: file.mimetype,
    size: file.size,
  });

  const { data, error } = await supabaseAdmin.storage
    .from(SERVICE_IMAGE_BUCKET)
    .upload(fileName, file.buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.mimetype,
    });

  if (error) {
    console.error("[SERVICE IMAGE] Upload failed:", error);
    throw new Error(error.message);
  }

  const { data: publicData } = supabaseAdmin.storage
    .from(SERVICE_IMAGE_BUCKET)
    .getPublicUrl(data.path);

  console.log("[SERVICE IMAGE] Upload success:", {
    path: data.path,
    publicUrl: publicData.publicUrl,
  });

  return {
    path: data.path,
    publicUrl: publicData.publicUrl,
  };
};

const extractStoragePathFromPublicUrl = (publicUrl) => {
  if (!publicUrl || typeof publicUrl !== "string") return null;

  try {
    /**
     * Example public URL:
     * https://xxxx.supabase.co/storage/v1/object/public/services-images/services/123-file.png
     *
     * We need:
     * services/123-file.png
     */
    const marker = `/storage/v1/object/public/${SERVICE_IMAGE_BUCKET}/`;
    const index = publicUrl.indexOf(marker);

    if (index === -1) {
      console.warn(
        "[SERVICE IMAGE] Could not extract storage path from URL:",
        publicUrl,
      );
      return null;
    }

    const path = publicUrl.substring(index + marker.length);

    console.log("[SERVICE IMAGE] Extracted old storage path:", path);
    return path || null;
  } catch (error) {
    console.error("[SERVICE IMAGE] Failed to parse public URL:", error);
    return null;
  }
};

const deleteServiceImageByUrl = async (publicUrl) => {
  if (!publicUrl) {
    console.log("[SERVICE IMAGE] No old image URL found. Skip delete.");
    return false;
  }

  const oldPath = extractStoragePathFromPublicUrl(publicUrl);

  if (!oldPath) {
    console.warn(
      "[SERVICE IMAGE] Old image path could not be determined. Skip delete.",
    );
    return false;
  }

  console.log("[SERVICE IMAGE] Attempting to delete old image:", {
    bucket: SERVICE_IMAGE_BUCKET,
    oldPath,
  });

  const { data, error } = await supabaseAdmin.storage
    .from(SERVICE_IMAGE_BUCKET)
    .remove([oldPath]);

  if (error) {
    console.error("[SERVICE IMAGE] Failed to delete old image:", error);
    return false;
  }

  console.log("[SERVICE IMAGE] Old image deleted successfully:", {
    removed: data,
    oldPath,
  });

  return true;
};

// ===============================
// GET ALL SERVICES (PUBLIC)
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
// GET SINGLE SERVICE BY ID (PUBLIC)
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

  const enrichedServices = (services || []).map((service) => ({
    ...service,
    hasBookings: bookedServiceIds.has(service.id),
  }));

  return enrichedServices;
};

// ===============================
// ADMIN: CREATE NEW SERVICE
// ===============================
export const createService = async ({ file, ...service }) => {
  let imageUrl = null;

  if (file) {
    const uploadedImage = await uploadServiceImage(file);
    imageUrl = uploadedImage.publicUrl;
  }

  const { data, error } = await supabaseAdmin
    .from("services")
    .insert([{ ...service, image_url: imageUrl }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  console.log("[SERVICE CREATE] Service created successfully:", {
    serviceId: data.id,
    name: data.name,
    image_url: data.image_url,
  });

  return data;
};

// ===============================
// ADMIN: UPDATE SERVICE
// ===============================
export const updateService = async (id, { file, ...service }) => {
  console.log("[SERVICE UPDATE] Starting update for service ID:", id);

  // 1. Get existing service first
  const { data: existingService, error: existingError } = await supabaseAdmin
    .from("services")
    .select("id, name, image_url")
    .eq("id", id)
    .single();

  if (existingError) {
    console.error(
      "[SERVICE UPDATE] Failed to fetch existing service:",
      existingError,
    );
    throw new Error(existingError.message);
  }

  if (!existingService) {
    throw new Error("Service not found");
  }

  console.log("[SERVICE UPDATE] Existing service found:", {
    id: existingService.id,
    name: existingService.name,
    oldImageUrl: existingService.image_url,
  });

  let newImageUrl = null;

  // 2. Upload new image if provided
  if (file) {
    const uploadedImage = await uploadServiceImage(file);
    newImageUrl = uploadedImage.publicUrl;
  }

  const updatedData = {
    ...service,
    ...(newImageUrl ? { image_url: newImageUrl } : {}),
    updated_at: new Date().toISOString(),
  };

  console.log("[SERVICE UPDATE] Updating service with data:", {
    id,
    hasNewImage: !!newImageUrl,
    updatedFields: Object.keys(updatedData),
  });

  // 3. Update row
  const { data: updatedRow, error: updateError } = await supabaseAdmin
    .from("services")
    .update(updatedData)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (updateError) {
    console.error("[SERVICE UPDATE] Database update failed:", updateError);
    throw new Error(updateError.message);
  }

  console.log("[SERVICE UPDATE] Update query returned:", updatedRow);

  // 4. Fallback fetch if update returned null
  let finalService = updatedRow;

  if (!finalService) {
    console.warn(
      "[SERVICE UPDATE] Update returned no row. Attempting fallback fetch...",
    );

    const { data: fetchedAfterUpdate, error: fetchAfterUpdateError } =
      await supabaseAdmin.from("services").select("*").eq("id", id).single();

    if (fetchAfterUpdateError) {
      console.error(
        "[SERVICE UPDATE] Fallback fetch failed:",
        fetchAfterUpdateError,
      );
      throw new Error(
        "Service update may have succeeded, but fetching updated row failed.",
      );
    }

    finalService = fetchedAfterUpdate;

    console.log("[SERVICE UPDATE] Fallback fetch success:", {
      id: finalService.id,
      name: finalService.name,
      image_url: finalService.image_url,
    });
  } else {
    console.log("[SERVICE UPDATE] Database update success:", {
      id: finalService.id,
      name: finalService.name,
      image_url: finalService.image_url,
    });
  }

  // 5. Delete old image only after successful update + only if new image exists
  if (newImageUrl && existingService.image_url) {
    console.log(
      "[SERVICE UPDATE] New image uploaded. Deleting old image now...",
    );
    await deleteServiceImageByUrl(existingService.image_url);
  } else if (newImageUrl && !existingService.image_url) {
    console.log(
      "[SERVICE UPDATE] New image uploaded, but no old image exists.",
    );
  } else {
    console.log(
      "[SERVICE UPDATE] No new image uploaded. Old image kept as-is.",
    );
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

// ===============================
// UPDATE CATEGORY
// ===============================
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

// ===============================
// DELETE / DEACTIVATE CATEGORY
// ===============================
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
// VARIANTS OF THE SERVICES
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

// ===============================
// UPDATE VARIANT
// ===============================
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

// ===============================
// DELETE / DEACTIVATE VARIANT
// ===============================
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
