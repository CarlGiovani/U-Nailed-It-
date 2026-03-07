import * as notificationService from "../../services/Admin_Notification_Feature/notificationService.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications();

    res.json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount();

    res.json({
      success: true,
      count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get unread notifications",
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await notificationService.markNotificationRead(id);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllRead();

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
};
