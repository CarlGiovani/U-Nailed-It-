import * as notificationService from "../../services/Admin_Notification_Feature/notificationService.js";

export const getNotifications = async (req, res) => {
  try {
    const adminId = req.admin?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: admin id is missing",
      });
    }

    const notifications = await notificationService.getNotifications(adminId);

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
    const adminId = req.admin?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: admin id is missing",
      });
    }

    const count = await notificationService.getUnreadCount(adminId);

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
    const adminId = req.admin?.id;
    const { id } = req.params;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: admin id is missing",
      });
    }

    const result = await notificationService.markNotificationRead(id, adminId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: result,
    });
  } catch (err) {
    const status =
      err.message.includes("Invalid notification id") ||
      err.message.includes("Admin id is required")
        ? 400
        : 500;

    res.status(status).json({
      success: false,
      message: "Failed to update notification",
      error: err.message,
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const adminId = req.admin?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: admin id is missing",
      });
    }

    await notificationService.markAllRead(adminId);

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
    const adminId = req.admin?.id;
    const { id } = req.params;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: admin id is missing",
      });
    }

    const deleted = await notificationService.deleteNotification(id, adminId);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: deleted,
    });
  } catch (err) {
    const status =
      err.message.includes("Invalid notification id") ||
      err.message.includes("Admin id is required")
        ? 400
        : 500;

    res.status(status).json({
      success: false,
      message: "Failed to delete single notification",
      error: err.message,
    });
  }
};

export const deleteNotificationsBulk = async (req, res) => {
  try {
    const adminId = req.admin?.id;
    const { ids } = req.body;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: admin id is missing",
      });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ids array is required",
      });
    }

    const deleted = await notificationService.deleteNotificationsBulk(
      ids,
      adminId,
    );

    res.status(200).json({
      success: true,
      message: "Selected notifications deleted successfully",
      data: deleted,
    });
  } catch (err) {
    console.error("BULK DELETE ERROR:", err);

    const status = err.message.includes("Admin id is required") ? 400 : 500;

    res.status(status).json({
      success: false,
      message: "Failed to bulk delete notifications",
      error: err.message,
    });
  }
};
