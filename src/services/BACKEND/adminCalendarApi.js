import api from "../axios";

/* ======================================
   PUBLIC: Get Available Slots (Day)
====================================== */
export const getAvailableSlots = async (service_id, date) => {
  const res = await api.get("/calendar/slots", {
    params: { service_id, date },
  });
  return res.data;
};

/* ======================================
   PUBLIC: Get Monthly Availability
====================================== */
export const getMonthlyAvailability = async (service_id, year, month) => {
  const res = await api.get("/calendar/availability", {
    params: { service_id, year, month },
  });
  return res.data;
};

/* ======================================
   ADMIN: Create Single Slot
====================================== */
export const createSlot = async (data) => {
  const res = await api.post("/calendar/slots", data);
  return res.data;
};

/* ======================================
   ADMIN: Update Slot
====================================== */
export const updateSlot = async (id, data) => {
  const res = await api.put(`/calendar/slots/${id}`, data);
  return res.data;
};

/* ======================================
   ADMIN: Delete Slot
====================================== */
export const deleteSlot = async (id) => {
  const res = await api.delete(`/calendar/slots/${id}`);
  return res.data;
};

/* ======================================
   ADMIN: Bulk Create Slots
====================================== */
export const createSlotsBulk = async (data) => {
  const res = await api.post("/calendar/slots/bulk", data);
  return res.data;
};

/* ======================================
   ADMIN: Block Day Globally
====================================== */
export const blockDayGlobally = async (date) => {
  const res = await api.post("/calendar/slots/block/day", { date });
  return res.data;
};

/* ======================================
   ADMIN: Unblock Day Globally
====================================== */
export const unblockDayGlobally = async (date) => {
  const res = await api.post("/calendar/slots/unblock/day", { date });
  return res.data;
};

/* ======================================
   ADMIN: Block Day Per Service
====================================== */
export const blockDayForService = async (service_id, date) => {
  const res = await api.post("/calendar/slots/block/day/service", {
    service_id,
    date,
  });
  return res.data;
};

/* ======================================
   ADMIN: Unblock Day Per Service
====================================== */
export const unblockDayForService = async (service_id, date) => {
  const res = await api.post("/calendar/slots/unblock/day/service", {
    service_id,
    date,
  });
  return res.data;
};