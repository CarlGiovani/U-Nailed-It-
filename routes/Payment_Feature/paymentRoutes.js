import express from "express";
import * as paymentController from "../../controllers/Payment_Feature/paymentController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";
import paymentUpload from "../../middlewares/uploads/paymentUploads.js";
const router = express.Router();

// PUBLIC
router.post(
  "/upload",
  paymentUpload.single("proof"),
  paymentController.uploadPaymentProof
);

// ADMIN
router.get("/view", verifyAdmin, paymentController.viewPaymentProof);

export default router;
