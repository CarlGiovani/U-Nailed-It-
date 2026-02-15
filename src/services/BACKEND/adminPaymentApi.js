import api from "../axios";

/* =====================================
   ADMIN: Get Signed URL for Payment Proof
===================================== */
export const getPaymentProofUrl = async (filePath) => {
  const res = await api.get("/payments/view", {
    params: { filePath },
  });

  return res.data.signedUrl;
};
