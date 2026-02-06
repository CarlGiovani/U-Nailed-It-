import express from "express";
import * as ReviewController from "../../controllers/Reviews_Feature/reviewsController.js"
import {verifyAdmin} from "../../middlewares/Authentication/authMiddleware.js"

const router = express.Router();


/* =========================
   PUBLIC
========================= */
router.post("/", ReviewController.createReview);
router.get("/", ReviewController.getApprovedReviews);

/* =========================
   ADMIN
========================= */
router.get("/admin", verifyAdmin, ReviewController.getAllReviewsAdmin);
router.patch("/:id/approve", verifyAdmin, ReviewController.approveReview);
router.patch("/:id/reject", verifyAdmin, ReviewController.rejectReview);

export default router;