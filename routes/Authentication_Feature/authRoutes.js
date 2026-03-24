import express from "express";
import * as AdminAuth from "../../controllers/Authentication_Feature/authController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

router.post("/create-account", verifyAdmin, AdminAuth.adminCreateAccount);
router.post("/login", AdminAuth.adminLogin);
router.post("/forgot-password", AdminAuth.forgotPassword);

router.post("/logout", verifyAdmin, AdminAuth.adminLogout);
router.post("/change-password", verifyAdmin, AdminAuth.changePassword);

export default router;
