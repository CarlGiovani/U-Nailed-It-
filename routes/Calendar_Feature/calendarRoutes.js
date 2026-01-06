import express from "express";
import * as CalendarController from "../../controllers/Calendar_Feature/calendarController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";
const router = express.Router();

// ADMIN
router.post("/slots", verifyAdmin , CalendarController.createSlot);
router.put("/slots/:id", verifyAdmin , CalendarController.updateSlot);
router.delete("/slots/:id", verifyAdmin , CalendarController.deleteSlot);

// PUBLIC
router.get("/slots", CalendarController.getAvailableSlots);

export default router;
