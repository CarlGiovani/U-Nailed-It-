import express from "express";
import * as BookingController from "../../controllers/Booking_Feature/bookingController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

// PUBLIC
router.post("/", BookingController.createBooking);










// ADMIN
router.get("/", verifyAdmin, BookingController.getAllBookings);
router.put("/:id/status", verifyAdmin, BookingController.updateBookingStatus);

// ADMIN
router.patch("/:id/approve", verifyAdmin, BookingController.approveBooking);
router.put("/:id/reject", verifyAdmin, BookingController.rejectBooking);

// PUBLIC
router.put("/:id/cancel", BookingController.cancelBooking);


export default router;
