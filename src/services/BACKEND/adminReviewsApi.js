import api from "../axios";

/* ===============================
   REVIEWS (PUBLIC)
================================= */

// VERIFY REVIEW TOKEN
export const verifyReviewToken = async (token) => {
  const res = await api.get(`/reviews/verify`, {
    params: { token },
  });
  return res.data;
};

// SUBMIT REVIEW
export const submitReview = async (payload) => {
  const res = await api.post("/reviews", payload);
  return res.data;
};

// GET APPROVED REVIEWS (PAGINATED)
export const getApprovedReviews = async (page = 1, limit = 6) => {
  const res = await api.get("/reviews", {
    params: { page, limit },
  });
  return res.data;
};

/* ===============================
   REVIEWS (ADMIN)
================================= */

// GET ALL REVIEWS (ADMIN)
export const getAllReviewsAdmin = async (
  page = 1,
  limit = 10,
  search = "",
  status = "all",
) => {
  const res = await api.get("/reviews/admin", {
    params: {
      page,
      limit,
      search,
      status,
    },
  });

  return res.data;
};

// APPROVE REVIEW
export const approveReview = async (id) => {
  const res = await api.patch(`/reviews/${id}/approve`);
  return res.data;
};

// REJECT REVIEW
export const rejectReview = async (id) => {
  const res = await api.patch(`/reviews/${id}/reject`);
  return res.data;
};
