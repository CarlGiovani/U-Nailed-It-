import express, { Router } from "express";
import * as BookingController from "../../controllers/Booking_Feature/bookingController.js";
import {verifyAdmin} from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

// PUBLIC 
router.post("/", BookingController.createBooking);

// ADMIN 
router.get("/", verifyAdmin, BookingController.getAllBookings);
router.put("./:id/status" , verifyAdmin , BookingController.updateBookingStatus);

export default router;