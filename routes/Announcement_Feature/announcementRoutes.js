import express from "express";
import * as AnnouncementController from "../../controllers/Announcement_Feature/announcementController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

import announcementImageUpload from "../../middlewares/uploads/announcementUpload.js";

const router = express.Router();

/* =====================================
   PUBLIC ROUTES
===================================== */
router.get("/active", AnnouncementController.fetchActiveAnnouncements);

/* =====================================
   ADMIN ROUTES
===================================== */
router.get("/", verifyAdmin, AnnouncementController.fetchAllAnnouncements);

router.post(
  "/",
  verifyAdmin,
  announcementImageUpload.array("images", 5),
  AnnouncementController.createAnnouncement,
);

router.put(
  "/:id",
  verifyAdmin,
  announcementImageUpload.array("images", 5),
  AnnouncementController.updateAnnouncement,
);

router.delete("/:id", verifyAdmin, AnnouncementController.deleteAnnouncement);

export default router;
