import api from "../axios";

/* ===============================
   ANNOUNCEMENTS (PUBLIC)
================================= */

// GET ACTIVE ANNOUNCEMENTS
export const getActiveAnnouncements = async () => {
  const res = await api.get("/announcements/active");
  return res.data;
};

/* ===============================
   ANNOUNCEMENTS (ADMIN)
================================= */

// GET ALL ANNOUNCEMENTS
export const getAllAnnouncements = async () => {
  const res = await api.get("/announcements");
  return res.data;
};

// CREATE ANNOUNCEMENT
export const createAnnouncement = async (formData) => {
  const res = await api.post("/announcements", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// UPDATE ANNOUNCEMENT
export const updateAnnouncement = async (id, formData) => {
  const res = await api.put(`/announcements/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// DELETE ANNOUNCEMENT
export const deleteAnnouncement = async (id) => {
  const res = await api.delete(`/announcements/${id}`);
  return res.data;
};
