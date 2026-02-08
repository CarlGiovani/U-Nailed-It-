import supabase from "../config/supabaseClient";

export const uploadReviewImage = async (file) => {
  if (!file) return null;

  // basic validation
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG, and WEBP images are allowed");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Image must be under 2MB");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `reviews/${crypto.randomUUID()}.${fileExt}`;

  // upload to Supabase Storage
  const { error } = await supabase.storage
    .from("review-images") // 👉 bucket name
    .upload(fileName, file);

  if (error) throw error;

  // get public URL
  const { data } = supabase.storage
    .from("review-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
};
