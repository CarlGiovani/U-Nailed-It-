import express from "express";
import * as CalendarController from "../../controllers/Calendar_Feature/calendarController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";
const router = express.Router();




// PUBLIC
router.get("/slots", CalendarController.getAvailableSlots);

router.get("/availability", CalendarController.getMonthlyAvailability);
// ADMIN
router.post("/slots", verifyAdmin , CalendarController.createSlot);
router.put("/slots/:id", verifyAdmin , CalendarController.updateSlot);
router.delete("/slots/:id", verifyAdmin , CalendarController.deleteSlot);

// Bulk slot creation
router.post("/slots/bulk", verifyAdmin, CalendarController.createSlotsBulk);

// Block/unblock full day
router.post("/slots/block/day", verifyAdmin, CalendarController.blockDayGlobally);
router.post("/slots/unblock/day", verifyAdmin, CalendarController.unblockDayGlobally);

// Block/unblock day per service
router.post("/slots/block/day/service", verifyAdmin, CalendarController.blockDayForService);
router.post("/slots/unblock/day/service", verifyAdmin, CalendarController.unblockDayForService);

export default router;
