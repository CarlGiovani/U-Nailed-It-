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

// ADMIN: approve booking
export const approveBooking = async (id) => {
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "approved",
      approved_at: new Date(),
    })
    .eq("id", id)
    .eq("status", "pending")
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// ADMIN: reject booking
export const rejectBooking = async (id) => {
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "rejected",
    })
    .eq("id", id)
    .eq("status", "pending")
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// PUBLIC: cancel booking (24-hour rule)
export const cancelBooking = async (id) => {
  // get booking
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  if (booking.status !== "approved") {
    throw new Error("Only approved bookings can be cancelled");
  }

  const approvedTime = new Date(booking.approved_at);
  const now = new Date();

  const diffHours = (now - approvedTime) / (1000 * 60 * 60);

  if (diffHours > 24) {
    throw new Error("Cancellation period expired (24 hours)");
  }

  const { data, error: cancelError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date(),
    })
    .eq("id", id)
    .select()
    .single();

  if (cancelError) throw new Error(cancelError.message);
  return data;
};
