import formatLocalDate from "../../utils/dateFormatter.js";
import supabase from "../../utils/supabaseClient.js";

/* =========================
   ADMIN : CREATE SINGLE SLOT
========================= */
export const createSlot = async (slot) => {
  const { data: existing } = await supabase
    .from("calendar_slots")
    .select("id")
    .eq("service_id", slot.service_id)
    .eq("date", slot.date)
    .eq("time", slot.time)
    .maybeSingle();

  if (existing)
    throw new Error("Slot already exists for this service, date and time");

  if (slot.is_available === undefined) slot.is_available = true;

  const { data, error } = await supabase
    .from("calendar_slots")
    .insert([slot])
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

/* =========================
   PUBLIC : GET AVAILABLE SLOTS (DAY)
========================= */
export const getAvailableSlots = async (service_id, date) => {
  if (!service_id || !date) throw new Error("Missing service_id or date");

  const now = new Date();
  const todayStr = formatLocalDate(now);
  const currentTime = now.toTimeString().slice(0, 5);

  let query = supabase
    .from("calendar_slots")
    .select("*")
    .eq("service_id", Number(service_id))
    .eq("date", date)
    .eq("is_available", true);

  // kung today, hide past times
  if (date === todayStr) {
    query = query.gt("time", currentTime);
  }

  const { data, error } = await query.order("time");
  if (error) throw new Error(error.message);
  return data;
};

/* =========================
   PUBLIC : MONTHLY AVAILABILITY
========================= */
export const getMonthlyAvailability = async (service_id, year, month) => {
  if (!service_id || !year || !month) throw new Error("Missing parameters");

  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  if (monthNum < 1 || monthNum > 12)
    throw new Error("Invalid month. Must be 1-12");

  const lastDay = new Date(yearNum, monthNum, 0).getDate();
  const startDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
  const endDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(
    lastDay,
  ).padStart(2, "0")}`;

  const now = new Date();
  const todayStr = formatLocalDate(now);
  const currentTime = now.toTimeString().slice(0, 5);

  const { data, error } = await supabase
    .from("calendar_slots")
    .select("date, time, is_available")
    .eq("service_id", Number(service_id))
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw new Error(error.message);

  const dayMap = {};

  for (const row of data) {
    // ignore past
    if (row.date < todayStr) continue;
    if (row.date === todayStr && row.time <= currentTime) continue;

    if (!dayMap[row.date]) dayMap[row.date] = false;

    // kahit isa lang available slot → available day
    if (row.is_available) dayMap[row.date] = true;
  }

  return Object.keys(dayMap).map((date) => ({ date, available: dayMap[date] }));
};

/* =========================
   ADMIN : UPDATE SLOT (SAFE)
========================= */
export const updateSlot = async (id, updates) => {
  const allowedUpdates = (({ date, time, is_available }) => ({
    date,
    time,
    is_available,
  }))(updates);

  const { data, error } = await supabase
    .from("calendar_slots")
    .update(allowedUpdates)
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

/* =========================
   ADMIN : DELETE SLOT
========================= */
export const deleteSlot = async (id) => {
  const { data, error } = await supabase
    .from("calendar_slots")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  return data;
};






/* =========================
   GLOBAL BLOCK / UNBLOCK
========================= */
export const blockSlotGlobally = async (date, time) => {
  const { data, error } = await supabase
    .from("calendar_slots")
    .update({ is_available: false })
    .eq("date", date)
    .eq("time", time)
    .select();

  if (error) throw new Error(error.message);
  return data;
};

// NOTE: this is "force unblock". Huwag gamitin sa normal reject/cancel flow.
export const unblockSlotGlobally = async (date, time) => {
  const { data, error } = await supabase
    .from("calendar_slots")
    .update({ is_available: true })
    .eq("date", date)
    .eq("time", time)
    .select();

  if (error) throw new Error(error.message);
  return data;
};





/* =========================
   BULK SLOT CREATION
========================= */
export const createSlotsBulk = async ({ service_id, startDate, endDate, times }) => {
  if (!service_id || !startDate || !endDate || !times?.length)
    throw new Error("Missing required parameters");

  const start = new Date(startDate);
  const end = new Date(endDate);

  const dates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  const slotsToInsert = [];

  for (const date of dates) {
    const dateStr = formatLocalDate(date);

    for (const time of times) {
      // ✅ Only active bookings block the slot
      const { data: takenGlobal, error: checkError } = await supabase
        .from("bookings")
        .select("id")
        .eq("booking_date", dateStr)
        .eq("booking_time", time)
        .in("status", ["pending_approval", "approved"])
        .maybeSingle();

      if (checkError) throw new Error(checkError.message);

      const isBlocked = !!takenGlobal;

      // if blocked globally, block all existing slots too
      if (isBlocked) {
        await supabase
          .from("calendar_slots")
          .update({ is_available: false })
          .eq("date", dateStr)
          .eq("time", time);
      }

      slotsToInsert.push({
        service_id,
        date: dateStr,
        time,
        is_available: isBlocked ? false : true,
      });
    }
  }

  const { data, error } = await supabase
    .from("calendar_slots")
    .upsert(slotsToInsert, { onConflict: ["service_id", "date", "time"] })
    .select();

  if (error) throw new Error(error.message);
  return data;
};

/* =========================
   BULK DAY BLOCKING
========================= */
export const blockDayGlobally = async (date, isAvailable = false) => {
  const { data, error } = await supabase
    .from("calendar_slots")
    .update({ is_available: isAvailable })
    .eq("date", date)
    .select();

  if (error) throw new Error(error.message);
  return data;
};

export const blockDayForService = async (service_id, date, isAvailable = false) => {
  const { data, error } = await supabase
    .from("calendar_slots")
    .update({ is_available: isAvailable })
    .eq("service_id", service_id)
    .eq("date", date)
    .select();

  if (error) throw new Error(error.message);
  return data;
};
