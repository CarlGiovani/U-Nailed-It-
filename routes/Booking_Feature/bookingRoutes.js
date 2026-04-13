import express from "express";
import * as BookingController from "../../controllers/Booking_Feature/bookingController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

/* =========================
   PUBLIC
========================= */

// Step 1: create booking (pending_payment)
router.post("/", BookingController.createBooking);

// Cancel approved booking by token
router.put("/cancel", BookingController.cancelBooking);

// Review page: fetch booking details by id
router.get("/:id", BookingController.getBookingById);

// Confirm button: confirm THIS booking using payment_intent_id
router.post("/:id/confirm", BookingController.confirmBooking);

// Temporary pending approval cancel-by-id route
router.patch(
  "/:id/cancel-pending",
  BookingController.cancelPendingApprovalBooking,
);


router.put("/cancel-pending", BookingController.cancelPendingApprovalBookingByToken);

/* =========================
   ADMIN
========================= */

router.get("/", verifyAdmin, BookingController.getAllBookings);
router.put("/:id/status", verifyAdmin, BookingController.updateBookingStatus);

router.patch("/:id/approve", verifyAdmin, BookingController.approveBooking);
router.patch("/:id/reject", verifyAdmin, BookingController.rejectBooking);
router.patch("/:id/complete", verifyAdmin, BookingController.completeBooking);

export default router;
