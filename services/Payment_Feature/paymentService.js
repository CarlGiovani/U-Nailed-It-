import crypto from "crypto";
import * as paymentModel from "../../models/Payment_Feature/paymentModel.js";

/**
 * Upload payment proof and create payment intent
 */
export const uploadPaymentProof = async ({
  email,
  service_id,
  service_variant_id,
  booking_date,
  booking_time,
  file,
  booking_id, // optional
}) => {
  // ---- Check required fields more clearly ----
  if (!file) throw new Error("Payment proof file is required");
  if (!email) throw new Error("Email is required");
  if (!service_id) throw new Error("Service ID is required");
  if (!booking_date) throw new Error("Booking date is required");
  if (!booking_time) throw new Error("Booking time is required");
  if (!booking_id) throw new Error("Booking ID is required for linking");

  // ---- Generate unique file path ----
  const filePath = `payment-proofs/${crypto.randomUUID()}`;

  // ---- Upload file to Supabase Storage ----
  await paymentModel.uploadFile(filePath, file);

  // ---- Set expiration: 30 minutes from now ----
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  // ---- Convert bigint fields properly ----
  const numericServiceId = Number(service_id);
  const numericServiceVariantId = service_variant_id ? Number(service_variant_id) : null;
  const numericBookingId = Number(booking_id);

  // ---- Create payment intent in DB ----
  const intent = await paymentModel.createPaymentIntent({
    email,
    service_id: numericServiceId,
    service_variant_id: numericServiceVariantId,
    booking_id: numericBookingId,
    booking_date,
    booking_time,
    proof_path: filePath,
    expires_at: expiresAt,
    status: "pending",
  });

  // ---- Create signed URL valid for 30 minutes ----
  const signedUrl = await paymentModel.createSignedUrl(filePath, 30 * 60);

  return {
    payment_intent_id: intent.id,
    expires_at: intent.expires_at,
    signedUrl,
  };
};

/**
 * Get signed URL for existing payment proof
 */
export const getPaymentProofUrl = async (filePath) => {
  if (!filePath) throw new Error("File path is required for generating signed URL");
  return await paymentModel.createSignedUrl(filePath, 30 * 60);
};
