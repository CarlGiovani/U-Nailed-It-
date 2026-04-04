import express from "express";
import * as AdminAuth from "../../controllers/Authentication_Feature/authController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

/* =========================
   PUBLIC ROUTES
========================= */
router.post("/login", AdminAuth.adminLogin);
router.post("/forgot-password", AdminAuth.forgotPassword);
router.post("/logout", AdminAuth.adminLogout);

/* =========================
   PROTECTED ROUTES
========================= */
router.post("/change-password", verifyAdmin, AdminAuth.changePassword);
router.post("/create-account", verifyAdmin, AdminAuth.adminCreateAccount);

router.get("/adminProfile", verifyAdmin, AdminAuth.getCurrentAdminProfile);
router.put("/adminProfile", verifyAdmin, AdminAuth.updateCurrentAdminProfile);
router.delete(
  "/adminProfile",
  verifyAdmin,
  AdminAuth.deleteCurrentAdminAccount,
);

router.get("/admins", verifyAdmin, AdminAuth.getAllAdmins);

export default router;
