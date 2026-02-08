import api from "../config/axios.js";

/* ===============================
   PUBLIC WEBSITE
   Display approved reviews only
=============================== */
export const getApprovedReviews = async () => {
  const res = await api.get("/reviews");
  return res.data;
};

/* ===============================
   REVIEW PAGE (from email link)
   Verify review token
=============================== */
export const verifyReviewToken = async (token) => {
  const res = await api.get("/reviews/verify", {
    params: { token },
  });
  return res.data;
};

/* ===============================
   REVIEW PAGE
   Submit review (token-based)
=============================== */
export const createReview = async ({ token, rating, comment, image_url }) => {
  const res = await api.post("/reviews", {
    token,
    rating,
    comment,
    image_url,
  });
  return res.data;
};
