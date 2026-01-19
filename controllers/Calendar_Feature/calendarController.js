import * as calendar from "../../models/Calendar_Feature/calendarModel.js";

// ADMIN create slot
export const createSlot = async (req, res) => {
  try {
    const slot = await calendar.createSlot(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUBLIC : get available slot
export const getAvailableSlots = async (req, res) => {
  const { service_id, date } = req.query;
  if(!service_id){
    return res.status(400).json({ error: "service_id is required" }); 
  }
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
    if (!updated) {
      return res.status(404).json({ error: "Slot not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
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





//TODO : TO BE TEST PA TONG ADDED FUNCTION NA TO

// ------------------------- BULK SLOT -------------------------

export const createSlotsBulk = async (req, res) => {
  try {
    const slots = await calendar.createSlotsBulk(req.body);
    res.status(201).json(slots);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const blockDayGlobally = async (req, res) => {
  try {
    const { date } = req.body;
    const data = await calendar.blockDayGlobally(date, false);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const unblockDayGlobally = async (req, res) => {
  try {
    const { date } = req.body;
    const data = await calendar.blockDayGlobally(date, true);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const blockDayForService = async (req, res) => {
  try {
    const { service_id, date } = req.body;
    const data = await calendar.blockDayForService(service_id, date, false);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const unblockDayForService = async (req, res) => {
  try {
    const { service_id, date } = req.body;
    const data = await calendar.blockDayForService(service_id, date, true);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};