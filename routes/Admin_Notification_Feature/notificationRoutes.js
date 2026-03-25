import express from "express";
import * as notificationController from "../../controllers/Admin_Notification_Feature/notificationController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

router.get("/", verifyAdmin, notificationController.getNotifications);
router.get("/unread-count", verifyAdmin, notificationController.getUnreadCount);

router.patch("/read-all", verifyAdmin, notificationController.markAllAsRead);
router.patch("/:id/read", verifyAdmin, notificationController.markAsRead);

router.delete(
  "/bulk/delete",
  verifyAdmin,
  notificationController.deleteNotificationsBulk,
);

router.delete(
  "/:id",
  verifyAdmin,
  notificationController.singleDeleteNotification,
);

export default router;
