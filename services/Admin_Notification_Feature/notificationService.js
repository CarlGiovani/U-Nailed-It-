import { NotificationModel } from "../../models/Admin_Notification_Feature/notificationModel.js";

export const getNotifications = async (adminId) => {
  return await NotificationModel.getAll(adminId);
};

export const getUnreadCount = async (adminId) => {
  return await NotificationModel.getUnreadCount(adminId);
};

export const markNotificationRead = async (id, adminId) => {
  return await NotificationModel.markAsRead(id, adminId);
};

export const markAllRead = async (adminId) => {
  return await NotificationModel.markAllAsRead(adminId);
};

export const deleteNotification = async (id, adminId) => {
  return await NotificationModel.deleteOne(id, adminId);
};

export const deleteNotificationsBulk = async (ids, adminId) => {
  return await NotificationModel.deleteBulk(ids, adminId);
};
