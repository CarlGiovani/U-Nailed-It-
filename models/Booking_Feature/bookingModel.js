import supabase from "../../utils/supabaseClient.js";
import { blockSlot } from "../Calendar_Feature/calendarModel.js";

// PUBLIC : create booking
export const createBooking = async (booking) => {
  // check slot availability
  const { data: slot, error: slotError } = await supabase
    .from("calendar_slots")
    .select("*")
    .eq("service_id", booking.service_id)
    .eq("date", booking.booking_date)
    .eq("time", booking.booking_time)
    .eq("is_available", true)
    .single();

  if (slotError || !slot) {
    throw new Error("Selected slot is no longer available");
  }
  // create booking
  const { data, error } = await supabase
    .from("bookings")
    .insert([
      {
        customer_id: booking.customer_id,
        service_id: booking.service_id,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        total_price: booking.total_price,
        downpayment: booking.downpayment,
        notes: booking.notes,
        status: "pending",
      },
    ])
    .select();
  if (error) throw new Error(error.message);
  // block slot (prevent double booking)
  await blockSlot(
    booking.service_id,
    booking.booking_date,
    booking.booking_time
  );

  return data[0];
};

// ADMIN: get all bookings
export const getAllBookings = async () => {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services(name),
      customers(full_name,email)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// ADMIN: update booking status
export const updateBookingStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) throw new Error(error.message);
  return data[0];
};
