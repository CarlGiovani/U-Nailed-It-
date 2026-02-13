import crypto from "crypto";
import supabase from "../../utils/supabaseClient.js";
import * as Announcement from "../../models/Announcement_Feature/announementModel.js";

/* ===============================
   Helper: Upload Image
================================ */
const uploadAnnouncementImage = async (file) => {
  const ext = file.originalname.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("announcement-images") 
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("announcement-images") 
    .getPublicUrl(fileName);

  return {
    publicUrl: data.publicUrl,
    fileName,
  };
};

/* ===============================
   Helper: Delete Images From Storage
================================ */
const deleteImagesFromStorage = async (imageUrls = []) => {
  const fileNames = imageUrls.map((url) => {
    const parts = url.split("/");
    return parts[parts.length - 1];
  });

  if (fileNames.length > 0) {
    await supabase.storage
      .from("announcement-images") 
      .remove(fileNames);
  }
};

/* ===============================
   PUBLIC: Get Active Announcements
================================ */
export const fetchActiveAnnouncements = async (req, res) => {
  try {
    const data = await Announcement.getActiveAnnouncements();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===============================
   ADMIN: Get All
================================ */
export const fetchAllAnnouncements = async (req, res) => {
  try {
    const data = await Announcement.getAllAnnouncements();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===============================
   CREATE
================================ */
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, start_date, end_date } = req.body;

    if (!title || !content || !start_date) {
      return res.status(400).json({
        error: "Title, content, and start_date are required",
      });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const { publicUrl } = await uploadAnnouncementImage(file);
        imageUrls.push(publicUrl);
      }
    }

    const payload = {
      title,
      content,
      start_date,
      end_date: end_date || null,
      images: imageUrls,
    };

    const created = await Announcement.createAnnouncement(payload);

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===============================
   UPDATE
================================ */
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, start_date, end_date, is_active } = req.body;

    const existing = await Announcement.getAllAnnouncements();
    const announcement = existing.find((a) => a.id == id);

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    let updatedImages = announcement.images || [];

    // If new images uploaded → replace old images
    if (req.files && req.files.length > 0) {
      // delete old images
      await deleteImagesFromStorage(updatedImages);
      updatedImages = [];
      for (const file of req.files) {
        const { publicUrl } = await uploadAnnouncementImage(file);
        updatedImages.push(publicUrl);
      }
    }

    const payload = {
      title,
      content,
      start_date,
      end_date,
      is_active,
      images: updatedImages,
    };

    const updated = await Announcement.updateAnnouncement(id, payload);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===============================
   DELETE
================================ */
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Announcement.getAllAnnouncements();
    const announcement = existing.find((a) => a.id == id);

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    // Delete images from storage
    await deleteImagesFromStorage(announcement.images || []);
    // Delete DB row
    await Announcement.deleteAnnouncement(id);

    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
