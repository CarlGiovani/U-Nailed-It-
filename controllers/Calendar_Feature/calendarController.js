import * as calendar from "../../models/Calendar_Feature/calendarModel.js";

// ADMIN: CREATE SLOT 
export const createSlot = async (req, res) => {
  console.log("[CREATE SLOT] body:", req.body);

  try {
    const slot = await calendar.createSlot(req.body);
    console.log("[CREATE SLOT] created:", slot);

    res.status(201).json(slot);
  } catch (err) {
    console.error("[CREATE SLOT ERROR]:", err);
    res.status(400).json({ error: err.message });
  }
};

// PUBLIC: GET AVAILABLE SLOTS 
export const getAvailableSlots = async (req, res) => {
  const { service_id, date } = req.query;
  console.log("[GET AVAILABLE SLOTS] query:", req.query);

  if (!service_id) {
    console.warn("[GET AVAILABLE SLOTS] missing service_id");
    return res.status(400).json({ error: "service_id is required" });
  }

  try {
    const slot = await calendar.getAvailableSlots(service_id, date);
    console.log("[GET AVAILABLE SLOTS] result:", slot);

    res.json(slot);
  } catch (err) {
    console.error("[GET AVAILABLE SLOTS ERROR]:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUBLIC: GET MONTHLY AVAILABILITY 
export const getMonthlyAvailability = async (req, res) => {
  console.log("[GET MONTHLY AVAILABILITY] query:", req.query);

  try {
    const { service_id, year, month } = req.query;
    const data = await calendar.getMonthlyAvailability(service_id, year, month);

    console.log("[GET MONTHLY AVAILABILITY] result:", data);
    res.json(data);
  } catch (err) {
    console.error("[GET MONTHLY AVAILABILITY ERROR]:", err);
    res.status(400).json({ error: err.message });
  }
};

// ADMIN: UPDATE SLOT
export const updateSlot = async (req, res) => {
  console.log("[UPDATE SLOT] id:", req.params.id);
  console.log("[UPDATE SLOT] body:", req.body);

  try {
    const updated = await calendar.updateSlot(req.params.id, req.body);

    if (!updated) {
      console.warn("[UPDATE SLOT] Slot not found:", req.params.id);
      return res.status(404).json({ error: "Slot not found" });
    }

    console.log("[UPDATE SLOT] updated:", updated);
    res.json(updated);
  } catch (err) {
    console.error("[UPDATE SLOT ERROR]:", err);
    res.status(400).json({ error: err.message });
  }
};

// ADMIN: DELETE SLOT 
export const deleteSlot = async (req, res) => {
  console.log("[DELETE SLOT] id:", req.params.id);

  try {
    await calendar.deleteSlot(req.params.id);
    console.log("[DELETE SLOT] success");

    res.json({ message: "SLOT DELETED!" });
  } catch (err) {
    console.error("[DELETE SLOT ERROR]:", err);
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: BULK CREATE SLOTS
export const createSlotsBulk = async (req, res) => {
  console.log("[CREATE SLOTS BULK] body:", req.body);

  try {
    const slots = await calendar.createSlotsBulk(req.body);
    console.log("[CREATE SLOTS BULK] created:", slots);

    res.status(201).json(slots);
  } catch (err) {
    console.error("[CREATE SLOTS BULK ERROR]:", err);
    res.status(400).json({ error: err.message });
  }
};

// ADMIN: BLOCK DAY GLOBALLY 
export const blockDayGlobally = async (req, res) => {
  console.log("[BLOCK DAY GLOBALLY] body:", req.body);

  try {
    const { date } = req.body;
    const data = await calendar.blockDayGlobally(date, false);

    console.log("[BLOCK DAY GLOBALLY] result:", data);
    res.json(data);
  } catch (err) {
    console.error("[BLOCK DAY GLOBALLY ERROR]:", err);
    res.status(400).json({ error: err.message });
  }
};

// ADMIN: UNBLOCK DAY GLOBALLY
export const unblockDayGlobally = async (req, res) => {
  console.log("[UNBLOCK DAY GLOBALLY] body:", req.body);

  try {
    const { date } = req.body;
    const data = await calendar.blockDayGlobally(date, true);

    console.log("[UNBLOCK DAY GLOBALLY] result:", data);
    res.json(data);
  } catch (err) {
    console.error("[UNBLOCK DAY GLOBALLY ERROR]:", err);
    res.status(400).json({ error: err.message });
  }
};

// ADMIN: BLOCK DAY FOR SERVICE 
export const blockDayForService = async (req, res) => {
  console.log("[BLOCK DAY FOR SERVICE] body:", req.body);

  try {
    const { service_id, date } = req.body;
    const data = await calendar.blockDayForService(service_id, date, false);

    console.log("[BLOCK DAY FOR SERVICE] result:", data);
    res.json(data);
  } catch (err) {
    console.error("[BLOCK DAY FOR SERVICE ERROR]:", err);
    res.status(400).json({ error: err.message });
  }
};

// ADMIN: UNBLOCK DAY FOR SERVICE 
export const unblockDayForService = async (req, res) => {
  console.log("[UNBLOCK DAY FOR SERVICE] body:", req.body);

  try {
    const { service_id, date } = req.body;
    const data = await calendar.blockDayForService(service_id, date, true);

    console.log("[UNBLOCK DAY FOR SERVICE] result:", data);
    res.json(data);
  } catch (err) {
    console.error("[UNBLOCK DAY FOR SERVICE ERROR]:", err);
    res.status(400).json({ error: err.message });
  }
};
