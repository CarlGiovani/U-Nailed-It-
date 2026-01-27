import express from "express";
import * as BookingController from "../../controllers/Booking_Feature/bookingController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

// PUBLIC
router.post("/", BookingController.createBooking);

// PUBLIC: confirm booking (after payment proof)
router.post("/confirm", BookingController.confirmBooking);

 
// ADMIN
router.get("/", verifyAdmin, BookingController.getAllBookings);
router.put("/:id/status", verifyAdmin, BookingController.updateBookingStatus);

// ADMIN
router.patch("/:id/approve", verifyAdmin, BookingController.approveBooking);
router.patch("/:id/reject", verifyAdmin, BookingController.rejectBooking);

// PUBLIC
router.put("/:id/cancel", BookingController.cancelBooking);

export default router;
