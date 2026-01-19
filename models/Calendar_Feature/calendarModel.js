import supabase from "../../utils/supabaseClient.js";

// ADMIN : add SLOT
export const createSlot = async (slot) => {
  // check if slot already exists
  const { data: existing } = await supabase
    .from("calendar_slots")
    .select("id")
    .eq("service_id", slot.service_id)
    .eq("date", slot.date)
    .eq("time", slot.time)
    .maybeSingle();

  if (existing) {
    throw new Error("Slot already exists for this service, date and time");
  }

   if (slot.is_available === undefined) slot.is_available = true;

  // insert if safe
  const { data, error } = await supabase
    .from("calendar_slots")
    .insert([slot])
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

// PUBLIC: get available slots per service
export const getAvailableSlots = async (service_id, date) => {
  let query = supabase
    .from("calendar_slots")
    .select("*")
    .eq("service_id", service_id)
    .eq("is_available", true)
    .order("time");

  if (date) {
    query = query.eq("date", date);
  }
  if(!service_id){
    throw new Error("service_id is required");
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

// ADMIN: update slot (block / unblock)
export const updateSlot = async (id, updates) => {
  const { data, error } = await supabase
    .from("calendar_slots")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

// ADMIN: delete slot
export const deleteSlot = async (id) => {
  const { data, error } = await supabase
    .from("calendar_slots")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  return data;
};

//BLOCK SLOT GLOBALLY IF MAY BAGONG BOOKING
export const blockSlotGlobally = async (date, time) => {
  const { data, error } = await supabase
    .from("calendar_slots")
    .update({ is_available: false })
    .eq("date", date)
    .eq("time", time)
    .select();

  if (error) throw new Error(error.message);
  return data; // lahat ng affected slots
};

// UNBLOCK SLOT GLOBAL IF MAY NA REJECT OR CANCEL
export const unblockSlotGlobally = async (date, time) => {
  const { data, error } = await supabase
    .from("calendar_slots")
    .update({ is_available: true })
    .eq("date", date)
    .eq("time", time);

  if (error) throw new Error(error.message);
  return data;
};




//TODO:  TO BE TEST PA TONG ADDED FUNCTION NA TO

// ------------------------- BULK SLOT CREATION -------------------------

export const createSlotsBulk = async ({ service_id, startDate, endDate, times }) => {
  if (!service_id || !startDate || !endDate || !times?.length) {
    throw new Error("Missing required parameters");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  const slotsToInsert = [];
  for (const date of dates) {
    const dateStr = date.toISOString().split("T")[0];
    for (const time of times) {
      slotsToInsert.push({
        service_id,
        date: dateStr,
        time,
        is_available: true,
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

// ------------------------- BULK BLOCK/UNBLOCK -------------------------

// Block/unblock full day for all services
export const blockDayGlobally = async (date, isAvailable = false) => {
  const { data, error } = await supabase
    .from("calendar_slots")
    .update({ is_available: isAvailable })
    .eq("date", date)
    .select();

  if (error) throw new Error(error.message);
  return data;
};

// Block/unblock full day for a specific service
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

