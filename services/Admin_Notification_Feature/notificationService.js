import { NotificationModel } from "../../models/Admin_Notification_Feature/notificationModel.js";

export const getNotifications = async () => {
  return await NotificationModel.getAll();
};

export const getUnreadCount = async () => {
  return await NotificationModel.getUnreadCount();
};

export const markNotificationRead = async (id) => {
  return await NotificationModel.markAsRead(id);
};

export const markAllRead = async () => {
  return await NotificationModel.markAllAsRead();
};

export const deleteNotification = async (id) => {
  return await NotificationModel.deleteOne(id);
};

export const deleteNotificationsBulk = async (ids) => {
  return await NotificationModel.deleteBulk(ids);
};
