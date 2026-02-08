import * as review from "../../models/Reviews_Feature/reviewsModel.js";
import {
  createReviewSchema,
  validate,
} from "../../utils/validators/reviewValidation.js";

/* ==========================================
   PUBLIC: POST /api/reviews
========================================== */

export const createReview = async (req, res) => {
  try {
    // ✅ galing sa body, hindi function args
    const { token, rating, comment, image_url } = req.body;

    // normalize
    const payload = {
      token,
      rating: Number(rating),
      comment: comment ?? null,
      image_url: image_url ?? null,
    };

    // ✅ Joi validation
    const errors = validate(createReviewSchema, payload);
    if (errors) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    // ✅ DELEGATE TO MODEL (important!)
    const data = await review.createReview(payload);

    return res.status(201).json(data);
  } catch (err) {
    return res.status(400).json({
      error: err.message,
    });
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
   PUBLIC: Verify review token
   GET /api/reviews/verify?token=xxx
========================================== */
export const verifyReviewToken = async (req, res) => {
  try {
    const { token } = req.query;
    const data = await review.verifyReviewToken(token);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
