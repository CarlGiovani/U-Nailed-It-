import express from "express";
import {
  getEmailSettings,
  updateEmailSettings,
  testEmailSettings,
} from "../../controllers/Email_Settings_Feature/emailSettingsController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

router.get("/", verifyAdmin, getEmailSettings);
router.put("/", verifyAdmin, updateEmailSettings);
router.post("/test", verifyAdmin, testEmailSettings);

export default router;