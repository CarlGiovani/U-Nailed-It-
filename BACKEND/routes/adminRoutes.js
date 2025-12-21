import express from "express";
import { loginAdmin, seedAdmin } from "../controllers/adminController.js";
const router = express.Router();

router.post("/seed", seedAdmin);
router.post("/login", loginAdmin);

export default router;
