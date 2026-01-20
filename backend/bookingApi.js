// backend/bookingApi.js
import api from "../config/axios.js";

// UPLOAD PAYMENT PROOF
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

// CREATE BOOKING
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

// GET BOOKING BY ID
export const getBookingById = async (id) => {
  try {
    console.log(`📋 Getting booking #${id}...`);
    const res = await api.get(`/bookings/${id}`);
    console.log("✅ Booking retrieved:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Get booking error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// GET USER BOOKINGS
export const getUserBookings = async (email) => {
  try {
    console.log(`📋 Getting bookings for ${email}...`);
    const res = await api.get("/bookings/user", {
      params: { email },
    });
    console.log("✅ User bookings:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Get user bookings error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
