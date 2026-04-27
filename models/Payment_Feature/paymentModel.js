import { supabaseAdmin } from "../../utils/supabaseClient.js";

// upload file
export const uploadFile = async (filepath, file) => {
  const { error } = await supabaseAdmin.storage
    .from("payment-proofs")
    .upload(filepath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }
};

// save file to booking
export const saveProofPath = async (booking_id, filePath) => {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update({ proof_payment_path: filePath })
    .eq("id", booking_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// NEW: create payment intent
export const createPaymentIntent = async (intentData) => {
  const { data, error } = await supabaseAdmin
    .from("payment_intents")
    .insert([intentData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// ADMIN :signed url
export const createSignedUrl = async (filePath, expiresIn = 1800) => {
  // 1800s = 30 min
  const { data, error } = await supabaseAdmin.storage
    .from("payment-proofs")
    .createSignedUrl(filePath, expiresIn);

  if (error) throw new Error(error.message);
  return data.signedUrl;
};
