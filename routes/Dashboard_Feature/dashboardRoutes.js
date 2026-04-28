import * as dashboardController from "../../controllers/Dashboard_Feature/dashboardController.js";
import express from "express";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

// ADMIN
router.get("/data", verifyAdmin, dashboardController.getDashboardData);
router.get("/export", verifyAdmin, dashboardController.getSystemExportData);
router.get(
  "/bookings/snapshot",
  verifyAdmin,
  dashboardController.getBookingSnapshot
);

// BLOCK / UNBLOCK CUSTOMER
router.patch("/customers/block", verifyAdmin, dashboardController.blockCustomer);
router.patch("/customers/unblock", verifyAdmin, dashboardController.unblockCustomer);

export default router;