import api from "../config/axios.js";

// CREATE BOOKING (Step 1)
export const createBooking = async (data) => {
  const res = await api.post("/bookings", data);
  return res.data;
};

// GET BOOKING BY ID (Review page)
export const getBookingById = async (bookingId) => {
  const res = await api.get(`/bookings/${bookingId}`);
  return res.data;
};

// UPLOAD PAYMENT PROOF (Step 2)
export const uploadPaymentProof = async (formData) => {
  const res = await api.post("/payments/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // dapat may payment_intent_id
};

// CONFIRM BOOKING (Step 3) - PER BOOKING ID
export const confirmBooking = async (bookingId, paymentIntentId) => {
  const res = await api.post(`/bookings/${bookingId}/confirm`, {
    payment_intent_id: paymentIntentId,
  });
  return res.data;
};

// CANCEL BOOKING public - PER TOKEN
export const cancelBookingPerToken = async (token) => {
  const res = await api.put(
    `/bookings/cancel?token=${encodeURIComponent(token)}`,
  );
  return res.data;
};
