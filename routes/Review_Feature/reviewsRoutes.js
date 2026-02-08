import express from "express";
import * as ReviewController from "../../controllers/Reviews_Feature/reviewsController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";
import {
  reviewSubmitLimiter,
  reviewVerifyLimiter,
} from "../../middlewares/reviewLimiter.js";

const router = express.Router();

/* =========================
   PUBLIC
========================= */
router.post("/", reviewSubmitLimiter, ReviewController.createReview);
router.get("/", ReviewController.getApprovedReviews);
router.get("/verify", reviewVerifyLimiter, ReviewController.verifyReviewToken);

/* =========================
   ADMIN
========================= */
router.get("/admin", verifyAdmin, ReviewController.getAllReviewsAdmin);
router.patch("/:id/approve", verifyAdmin, ReviewController.approveReview);
router.patch("/:id/reject", verifyAdmin, ReviewController.rejectReview);

export default router;
