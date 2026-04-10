// routes/jobRoutes.js
import express from "express";
import { runBookingExpiryManually, runSlotBlockJob, runSlotCleanupJob } from "../../controllers/Cron_Job_Feature/cronJobController.js";

const router = express.Router();

router.post("/booking-expiry", runBookingExpiryManually);
router.post("/slot-block", runSlotBlockJob);
router.post("/slot-cleanup", runSlotCleanupJob);

export default router;
