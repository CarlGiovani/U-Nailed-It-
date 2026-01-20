// src/api/paymentApi.js
import api from "../../src/config/axios.js";

// Upload proof of payment
export const uploadPaymentProof = async (formData) => {
  // formData = FormData object na may "proof" file at booking info kung kailangan
  const res = await api.post("/payments/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
