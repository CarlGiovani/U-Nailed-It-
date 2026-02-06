import * as review from "../../models/Reviews_Feature/reviewsModel.js";
import { createReviewSchema, validate } from "../../utils/validators/reviewValidation.js";

/* ==========================================
   PUBLIC: POST /api/reviews
========================================== */
export const createReview = async (req, res) => {
  const errors = validate(createReviewSchema, req.body);
  if (errors) return res.status(400).json({ errors });

  try {
    const created = await review.createReview(req.body);
    res.status(201).json({ message: "Review submitted (pending approval)", review: created });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ==========================================
   PUBLIC: GET /api/reviews (approved only)
========================================== */
export const getApprovedReviews = async (req, res) => {
  try {
    const data = await review.getApprovedReviews();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ==========================================
   ADMIN: GET /api/reviews/admin
========================================== */
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const data = await review.getAllReviewsAdmin();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ==========================================
   ADMIN: PATCH /api/reviews/:id/approve
========================================== */
export const approveReview = async (req, res) => {
  try {
    const data = await review.approveReview(req.params.id);
    res.json({ message: "Review approved", review: data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ==========================================
   ADMIN: PATCH /api/reviews/:id/reject
========================================== */
export const rejectReview = async (req, res) => {
  try {
    const data = await review.rejectReview(req.params.id);
    res.json({ message: "Review rejected", review: data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


