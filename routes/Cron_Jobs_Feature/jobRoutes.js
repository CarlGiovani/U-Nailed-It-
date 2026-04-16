import express from "express";
import {
  runBookingExpiryManually,
  runSlotBlockJob,
  runSlotCleanupJob,
   listMonthlyReports,
  runMonthlyReportJob,
  runMonthlyReportManually,
} from "../../controllers/Cron_Job_Feature/cronJobController.js";

const router = express.Router();

router.post("/send-booking-reminders", runBookingExpiryManually);
router.post("/block-past-slots", runSlotBlockJob);
router.post("/cleanup-old-slots", runSlotCleanupJob);
router.post("/generate-monthly-report", runMonthlyReportJob);

/* Optional admin/manual routes */
router.post("/generate-monthly-report/manual", runMonthlyReportManually);
router.get("/monthly-reports", listMonthlyReports);

export default router;