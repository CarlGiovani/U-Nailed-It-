import { supabaseAdmin } from "../../utils/supabaseClient.js";

const BUCKET_NAME = "portfolio";

// Convert full public URL to storage file path
const extractStoragePath = (imageUrl) => {
  if (!imageUrl) return null;

  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  const path = imageUrl.substring(index + marker.length);

  return path;
};

const deleteFilesFromStorage = async (
  imageUrls = [],
  context = "STORAGE DELETE",
) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return;
  }

  const filePaths = imageUrls.map(extractStoragePath).filter(Boolean);

  if (filePaths.length === 0) {
    return;
  }
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (error) {
    return;
  }
};

// CREATE
export const createPortfolio = async (payload) => {
  const { data, error } = await supabaseAdmin
    .from("portfolio")
    .insert([payload])
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};

// READ ALL
export const getAllPortfolio = async () => {
  const { data, error } = await supabaseAdmin
    .from("portfolio")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return data;
};

// READ BY ID
export const getPortfolioById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from("portfolio")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};

// UPDATE
export const updatePortfolio = async (id, payload) => {
  // get old record
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("portfolio")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!existing) {
    throw new Error("Portfolio item not found.");
  }

  const oldImages = Array.isArray(existing.images) ? existing.images : [];
  const newImages = Array.isArray(payload.images) ? payload.images : oldImages;

  // Update the row
  const { data, error } = await supabaseAdmin
    .from("portfolio")
    .update(payload)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  // Find removed images
  const removedImages = oldImages.filter(
    (oldUrl) => !newImages.includes(oldUrl),
  );
  if (removedImages.length > 0) {
    await deleteFilesFromStorage(removedImages, "UPDATE DELETE OLD IMAGES");
  } else {
  }
  return data;
};

// DELETE
export const deletePortfolio = async (id) => {
  // Get existing record first
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("portfolio")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!existing) {
    throw new Error("Portfolio item not found.");
  }
  const existingImages = Array.isArray(existing.images) ? existing.images : [];

  // 2. Delete all images from storage
  if (existingImages.length > 0) {
    await deleteFilesFromStorage(existingImages, "DELETE PORTFOLIO IMAGES");
  } else {
  }

  // 3. Delete row from database
  const { error } = await supabaseAdmin.from("portfolio").delete().eq("id", id);
  if (error) {
    throw error;
  }
};
