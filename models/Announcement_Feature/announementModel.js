import { supabaseAdmin } from "../../utils/supabaseClient.js";

const BUCKET_NAME = "announcement-images";

// Convert full public URL to storage file path
const extractStoragePath = (imageUrl) => {
  if (!imageUrl) return null;

  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    console.warn("[ANNOUNCEMENT][EXTRACT PATH] Invalid image URL:", imageUrl);
    return null;
  }

  const path = imageUrl.substring(index + marker.length);
  console.log("[ANNOUNCEMENT][EXTRACT PATH] Extracted:", path);

  return path;
};

const deleteFilesFromStorage = async (
  imageUrls = [],
  context = "ANNOUNCEMENT STORAGE DELETE",
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

  const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).remove(filePaths);

  if (error) {
    console.error(`[${context}] Storage delete failed:`, error);
    return;
  }

  console.log(`[${context}] Storage delete success`);
};

/* ==========================================
   PUBLIC: fetch active announcements
========================================== */
export const getActiveAnnouncements = async () => {
  const today = new Date().toISOString().split("T")[0];
  console.log("[ANNOUNCEMENT][GET ACTIVE] Today:", today);

  const { data, error } = await supabaseAdmin 
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[ANNOUNCEMENT][GET ACTIVE] Error:", error);
    throw new Error(error.message);
  }

  console.log("[ANNOUNCEMENT][GET ACTIVE] Count:", data?.length || 0);
  return data;
};

/* ==========================================
   ADMIN: getAllAnnouncements
========================================== */
export const getAllAnnouncements = async () => {
  console.log("[ANNOUNCEMENT][GET ALL] Fetching all announcements...");

  const { data, error } = await supabaseAdmin
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[ANNOUNCEMENT][GET ALL] Error:", error);
    throw new Error(error.message);
  }

  console.log("[ANNOUNCEMENT][GET ALL] Count:", data?.length || 0);
  return data;
};

/* ==========================================
   ADMIN: createAnnouncement
========================================== */
export const createAnnouncement = async (payload) => {
  console.log("[ANNOUNCEMENT][CREATE] Payload:", payload);

  const { data, error } = await supabaseAdmin
    .from("announcements")
    .insert([payload])
    .select()
    .maybeSingle();

  if (error) {
    console.error("[ANNOUNCEMENT][CREATE] Error:", error);
    throw new Error(error.message);
  }

  console.log("[ANNOUNCEMENT][CREATE] Success:", data);
  return data;
};

/* ==========================================
   ADMIN: updateAnnouncement
========================================== */
export const updateAnnouncement = async (id, payload) => {
  console.log("\n[ANNOUNCEMENT][UPDATE] =====================");
  console.log("[ANNOUNCEMENT][UPDATE] ID:", id);
  console.log("[ANNOUNCEMENT][UPDATE] Payload:", payload);

  // 1. Get existing record first
  const { data: existing, error: fetchError } = await supabaseAdmin   
    .from("announcements")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("[ANNOUNCEMENT][UPDATE] Fetch existing error:", fetchError);
    throw new Error(fetchError.message);
  }

  if (!existing) {
    console.error("[ANNOUNCEMENT][UPDATE] Announcement not found");
    throw new Error("Announcement not found.");
  }

  console.log("[ANNOUNCEMENT][UPDATE] Existing record:", existing);

  const oldImages = Array.isArray(existing.images) ? existing.images : [];
  const newImages = Array.isArray(payload.images) ? payload.images : oldImages;

  console.log("[ANNOUNCEMENT][UPDATE] Old images:", oldImages);
  console.log("[ANNOUNCEMENT][UPDATE] New images:", newImages);

  // 2. Update DB row without forcing returned row
  const { error: updateError } = await supabaseAdmin
    .from("announcements")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    console.error("[ANNOUNCEMENT][UPDATE] DB update error:", updateError);
    throw new Error(updateError.message);
  }

  console.log("[ANNOUNCEMENT][UPDATE] Update query success");

  // 3. Re-fetch updated row
  const { data: updatedRow, error: refetchError } = await supabaseAdmin
    .from("announcements")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (refetchError) {
    console.error("[ANNOUNCEMENT][UPDATE] Refetch error:", refetchError);
    throw new Error(refetchError.message);
  }

  if (!updatedRow) {
    console.error(
      "[ANNOUNCEMENT][UPDATE] No updated row returned after refetch",
    );
    throw new Error("Announcement update failed: row not found after update.");
  }

  console.log("[ANNOUNCEMENT][UPDATE] Refetched updated row:", updatedRow);

  // 4. Delete removed old images
  const removedImages = oldImages.filter(
    (oldUrl) => !newImages.includes(oldUrl),
  );

  console.log("[ANNOUNCEMENT][UPDATE] Removed images:", removedImages);

  if (removedImages.length > 0) {
    await deleteFilesFromStorage(
      removedImages,
      "ANNOUNCEMENT UPDATE DELETE OLD IMAGES",
    );
  } else {
    console.log("[ANNOUNCEMENT][UPDATE] No old images to delete");
  }

  console.log("[ANNOUNCEMENT][UPDATE] =====================\n");
  return updatedRow;
};

/* ==========================================
   ADMIN: deleteAnnouncement
========================================== */
export const deleteAnnouncement = async (id) => {
  console.log("\n[ANNOUNCEMENT][DELETE] =====================");
  console.log("[ANNOUNCEMENT][DELETE] ID:", id);

  // 1. Get existing record first
  const { data: existing, error: fetchError } = await supabaseAdmin   
    .from("announcements")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("[ANNOUNCEMENT][DELETE] Fetch error:", fetchError);
    throw new Error(fetchError.message);
  }

  if (!existing) {
    console.error("[ANNOUNCEMENT][DELETE] Announcement not found");
    throw new Error("Announcement not found.");
  }

  console.log("[ANNOUNCEMENT][DELETE] Existing record:", existing);

  const existingImages = Array.isArray(existing.images) ? existing.images : [];
  console.log("[ANNOUNCEMENT][DELETE] Existing images:", existingImages);

  // 2. Delete all images from storage
  if (existingImages.length > 0) {
    await deleteFilesFromStorage(existingImages, "ANNOUNCEMENT DELETE IMAGES");
  } else {
    console.log("[ANNOUNCEMENT][DELETE] No images to delete");
  }

  // 3. Delete DB row
  const { error } = await supabaseAdmin.from("announcements").delete().eq("id", id);

  if (error) {
    console.error("[ANNOUNCEMENT][DELETE] DB delete error:", error);
    throw new Error(error.message);
  }

  console.log("[ANNOUNCEMENT][DELETE] DB row deleted successfully");
  console.log("[ANNOUNCEMENT][DELETE] =====================\n");
};
