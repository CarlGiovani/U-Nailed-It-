import * as dashboardController from "../../controllers/Dashboard_Feature/dashboardController.js";
import express from "express";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

// ADMIN
router.get("/data", verifyAdmin, dashboardController.getDashboardData);
router.get("/export", verifyAdmin, dashboardController.getSystemExportData);

// BLOCK / UNBLOCK CUSTOMER
router.patch("/customers/block", verifyAdmin, dashboardController.blockCustomer);
router.patch("/customers/unblock", verifyAdmin, dashboardController.unblockCustomer);

export default router;