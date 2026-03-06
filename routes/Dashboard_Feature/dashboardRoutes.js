import * as dashboardController from "../../controllers/Dashboard_Feature/dashboardController.js";
import express from "express";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";
const router = express.Router();

// ADMIN
router.get("/data", verifyAdmin, dashboardController.getDashboardData);

export default router;



