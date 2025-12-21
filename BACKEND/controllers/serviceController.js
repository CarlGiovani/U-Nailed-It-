import { v4 as uuidv4 } from "uuid";
import { supabase } from "../config/db.js";
import * as ServiceModel from "../models/ServiceModel.js";

// Public: get all active services
export async function getActiveServices(req, res) {
  try {
    const services = await ServiceModel.getAllActive();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Admin: get all services
export async function getAllServices(req, res) {
  try {
    const services = await ServiceModel.getAll();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Create or update
export async function upsertService(req, res) {
  try {
    const { id, name, price, duration_minutes, is_active } = req.body;
    if (!name || !price || !duration_minutes)
      return res.status(400).json({ message: "Missing fields" });

    let image_url = null;
    if (req.files && req.files.image) {
      const file = req.files.image;
      const fileName = `${uuidv4()}.${file.name.split(".").pop()}`;

      const { error: uploadError } = await supabase.storage
        .from("services-images")
        .upload(fileName, file.data, {
          contentType: file.mimetype,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("services-images")
        .getPublicUrl(fileName);

      image_url = publicData.publicUrl;
    }

    await ServiceModel.upsert({
      id,
      name,
      price,
      duration_minutes,
      image_url,
      is_active: is_active ?? true,
    });

    res.json({ message: "Service saved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

//Delete
export async function deleteService(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing service ID" });
    await ServiceModel.remove(id);
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
