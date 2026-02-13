import api from "../config/axios";

export const getActiveAnnouncements = async () => {
  const res = await api.get("/announcements/active");

  return res.data;
};
