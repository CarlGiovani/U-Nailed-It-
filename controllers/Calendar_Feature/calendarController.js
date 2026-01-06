import * as calendar from "../../models/Calendar_Feature/calendarModel.js";

// ADMIN create slot
export const createSlot = async (req, res) => {
  try {
    const slot = await calendar.createSlot(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUBLIC : get available slot
export const getAvailableSlots = async (req, res) => {
  const { service_id, date } = req.query;

  try {
    const slot = await calendar.getAvailableSlots(service_id, date);
    res.json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Update slot
export const updateSlot = async (req, res) => {
  try {
    const updated = await calendar.updateSlot(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: delete slot
export const deleteSlot = async (req, res) => {
  try {
    await calendar.deleteSlot(req.params.id);
    res.json({ message: "SLOT DELETED!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



