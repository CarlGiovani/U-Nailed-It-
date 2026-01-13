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
    .single();

  if (existing) {
    throw new Error("Slot already exists for this service, date and time");
  }

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

// ADMIN: block slot after booking Later, kapag booking approved, tawagin ito para hindi ma-double book.
export const blockSlot = async (service_id, date, time) => {
  const { data, error } = await supabase
    .from("calendar_slots")
    .update({ is_available: false })
    .eq("service_id", service_id)
    .eq("date", date)
    .eq("time", time)
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};

// ADMIN/PUBLIC: unblock slot
export const unblockSlot = async (service_id, date, time) => {
  const { error } = await supabase
    .from("calendar_slots")
    .update({ is_available: true })
    .eq("service_id", service_id)
    .eq("date", date)
    .eq("time", time);

  if (error) throw new Error(error.message);
};
