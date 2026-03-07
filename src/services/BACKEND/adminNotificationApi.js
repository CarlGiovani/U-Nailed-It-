import api from "../axios";

/* ===============================
   ADMIN NOTIFICATIONS
================================= */

// GET ALL NOTIFICATIONS
export const getNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

// GET UNREAD NOTIFICATION COUNT
export const getUnreadNotificationCount = async () => {
  const res = await api.get("/notifications/unread-count");
  return res.data;
};

// MARK NOTIFICATION AS READ
export const markNotificationAsRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

// MARK ALL NOTIFICATIONS AS READ
export const markAllNotificationsAsRead = async () => {
  const res = await api.patch("/notifications/read-all");
  return res.data;
};
