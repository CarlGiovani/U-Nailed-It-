import supabase from "../../utils/supabaseClient.js";

const BUCKET_NAME = "portfolio";

// Convert full public URL to storage file path
const extractStoragePath = (imageUrl) => {
  if (!imageUrl) return null;

  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    console.warn("[EXTRACT PATH] Invalid image URL:", imageUrl);
    return null;
  }

  const path = imageUrl.substring(index + marker.length);
  console.log("[EXTRACT PATH] Extracted:", path);

  return path;
};

const deleteFilesFromStorage = async (
  imageUrls = [],
  context = "STORAGE DELETE",
) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    console.log(`[${context}] No files to delete`);
    return;
  }

  const filePaths = imageUrls.map(extractStoragePath).filter(Boolean);

  if (filePaths.length === 0) {
    console.log(`[${context}] No valid file paths extracted`);
    return;
  }

  console.log(`[${context}] Deleting file paths:`, filePaths);

  const { error } = await supabase.storage.from(BUCKET_NAME).remove(filePaths);

  if (error) {
    console.error(`[${context}] Storage delete failed:`, error);
    return;
  }

  console.log(`[${context}] Storage delete success`);
};

// CREATE
export const createPortfolio = async (payload) => {
  console.log("[CREATE] Payload:", payload);

  const { data, error } = await supabase
    .from("portfolio")
    .insert([payload])
    .select()
    .maybeSingle();

  if (error) {
    console.error("[CREATE] Error:", error);
    throw error;
  }

  console.log("[CREATE] Success:", data);
  return data;
};

// READ ALL
export const getAllPortfolio = async () => {
  console.log("[GET ALL] Fetching portfolios...");

  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET ALL] Error:", error);
    throw error;
  }

  console.log("[GET ALL] Count:", data?.length || 0);
  return data;
};

// READ BY ID
export const getPortfolioById = async (id) => {
  console.log("[GET BY ID] ID:", id);

  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[GET BY ID] Error:", error);
    throw error;
  }

  console.log("[GET BY ID] Result:", data);
  return data;
};

// UPDATE
export const updatePortfolio = async (id, payload) => {
  console.log("\n[UPDATE] =====================");
  console.log("[UPDATE] ID:", id);
  console.log("[UPDATE] Payload:", payload);

  // 1. Get old record first
  const { data: existing, error: fetchError } = await supabase
    .from("portfolio")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("[UPDATE] Fetch error:", fetchError);
    throw fetchError;
  }

  if (!existing) {
    console.error("[UPDATE] Portfolio not found");
    throw new Error("Portfolio item not found.");
  }

  console.log("[UPDATE] Existing record:", existing);

  const oldImages = Array.isArray(existing.images) ? existing.images : [];
  const newImages = Array.isArray(payload.images) ? payload.images : oldImages;

  console.log("[UPDATE] Old images:", oldImages);
  console.log("[UPDATE] New images:", newImages);

  // 2. Update the row
  const { data, error } = await supabase
    .from("portfolio")
    .update(payload)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[UPDATE] DB update error:", error);
    throw error;
  }

  console.log("[UPDATE] DB updated:", data);

  // 3. Find removed images
  const removedImages = oldImages.filter(
    (oldUrl) => !newImages.includes(oldUrl),
  );

  console.log("[UPDATE] Removed images:", removedImages);

  if (removedImages.length > 0) {
    await deleteFilesFromStorage(removedImages, "UPDATE DELETE OLD IMAGES");
  } else {
    console.log("[UPDATE] No old images to delete");
  }

  console.log("[UPDATE] =====================\n");
  return data;
};

// DELETE
export const deletePortfolio = async (id) => {
  console.log("\n[DELETE] =====================");
  console.log("[DELETE] ID:", id);

  // 1. Get existing record first
  const { data: existing, error: fetchError } = await supabase
    .from("portfolio")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("[DELETE] Fetch error:", fetchError);
    throw fetchError;
  }

  if (!existing) {
    console.error("[DELETE] Portfolio not found");
    throw new Error("Portfolio item not found.");
  }

  console.log("[DELETE] Existing record:", existing);

  const existingImages = Array.isArray(existing.images) ? existing.images : [];
  console.log("[DELETE] Existing images:", existingImages);

  // 2. Delete all images from storage
  if (existingImages.length > 0) {
    await deleteFilesFromStorage(existingImages, "DELETE PORTFOLIO IMAGES");
  } else {
    console.log("[DELETE] No images to delete");
  }

  // 3. Delete row from database
  const { error } = await supabase.from("portfolio").delete().eq("id", id);

  if (error) {
    console.error("[DELETE] DB delete error:", error);
    throw error;
  }

  console.log("[DELETE] DB row deleted successfully");
  console.log("[DELETE] =====================\n");
};
