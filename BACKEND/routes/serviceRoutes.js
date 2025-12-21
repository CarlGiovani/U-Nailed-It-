import express from "express";
import fileUpload from "express-fileupload";
import { requireAdmin } from "../middlewares/auth.js";
import {
  getActiveServices,
  getAllServices,
  upsertService,
  deleteService,
} from "../controllers/serviceController.js";

const router = express.Router();
router.use(fileUpload());

// Public
router.get("/", getActiveServices);

// Admin
router.get("/admin/all", requireAdmin, getAllServices);
router.post("/admin/upsert", requireAdmin, upsertService);
router.delete("/admin/:id", requireAdmin, deleteService);

export default router;
