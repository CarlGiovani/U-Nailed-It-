import * as notificationService from "../../services/Admin_Notification_Feature/notificationService.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: err.message,
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount();

    res.status(200).json({
      success: true,
      count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get unread notifications",
      error: err.message,
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await notificationService.markNotificationRead(id);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: result,
    });
  } catch (err) {
    const status = err.message.includes("Invalid notification id") ? 400 : 500;

    res.status(status).json({
      success: false,
      message: "Failed to update notification",
      error: err.message,
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllRead();

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update notifications",
      error: err.message,
    });
  }
};

export const singleDeleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await notificationService.deleteNotification(id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: deleted,
    });
  } catch (err) {
    const status = err.message.includes("Invalid notification id") ? 400 : 500;

    res.status(status).json({
      success: false,
      message: "Failed to delete single notification",
      error: err.message,
    });
  }
};

export const deleteNotificationsBulk = async (req, res) => {
  try {
    console.log("BODY SA BULK DELETE:", req.body);

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ids array is required",
      });
    }

    const deleted = await notificationService.deleteNotificationsBulk(ids);

    res.json({
      success: true,
      message: "Selected notifications deleted successfully",
      data: deleted,
    });
  } catch (err) {
    console.error("BULK DELETE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to bulk delete notifications",
      error: err.message,
    });
  }
};
