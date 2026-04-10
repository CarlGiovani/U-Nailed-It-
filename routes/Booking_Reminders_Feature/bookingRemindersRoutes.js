import express from "express";
import { runBookingReminderJob } from "../../controllers/Booking_Reminder_Feature/bookingReminderController.js";

const router = express.Router();

router.post("/jobs/send-booking-reminders", runBookingReminderJob);

export default router;