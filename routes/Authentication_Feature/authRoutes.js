import express from "express";
import { adminLogin } from "../../controllers/Authentication_Feature/authController.js";

const router = express.Router();

router.post("/login", adminLogin);

export default router;
