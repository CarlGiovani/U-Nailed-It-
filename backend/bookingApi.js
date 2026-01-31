import api from "../config/axios.js";

// CREATE BOOKING (Step 1)
export const createBooking = async (data) => {
  try {
    console.log("📝 Creating booking...", data);
    const res = await api.post("/bookings", data);
    console.log("✅ Booking created:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Booking error:", error.response?.data || error.message);
    throw error;
  }
};

// UPLOAD PAYMENT PROOF (Step 2)
export const uploadPaymentProof = async (formData) => {
  try {
    console.log("📤 Uploading payment proof...");
    const res = await api.post("/payments/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("✅ Payment proof uploaded:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Upload error:", error.response?.data || error.message);
    throw error;
  }
};

// CONFIRM BOOKING (Step 3)
export const confirmBooking = async (paymentIntentId) => {
  try {
    console.log("✅ Confirming booking with payment intent:", paymentIntentId);

    // TRY DIFFERENT FIELD NAMES:
    const payload = {
      payment_intent_id: paymentIntentId,
      // OR
      paymentIntentId: paymentIntentId,
      // OR
      id: paymentIntentId,
      // OR
      reference_id: paymentIntentId,
    };

    console.log("Sending payload:", payload);
    const res = await api.post("/bookings/confirm", payload);

    console.log("✅ Booking confirmed:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Full confirmation error:", error);
    console.error("Response data:", error.response?.data);
    console.error("Status:", error.response?.status);
    throw error;
  }
};
