import supabase from "../../utils/supabaseClient.js";
import {
  blockSlotGlobally,
  unblockSlotGlobally,
} from "../Calendar_Feature/calendarModel.js";
import { getOrCreateCustomer } from "../Customer_Feature/customerModel.js";


// PUBLIC: create booking with customer info (create customer if not exists) ALL IN ONE
// GUMAGANA NA TO
export const createBookingWithCustomer = async (bookingData) => {
  const {
    service_id,
    booking_date,
    booking_time,
    total_price,
    downpayment,
    notes,
    full_name,
    email,
    phone,
    facebook_link,
  } = bookingData;

  // 1️⃣ Get or create customer
  const customer = await getOrCreateCustomer({
    full_name,
    email,
    phone,
    facebook_link,
  });

  // 2️⃣ Check slot availability (specific service)
  const { data: slot, error: slotError } = await supabase
    .from("calendar_slots")
    .select("*")
    .eq("service_id", service_id)
    .eq("date", booking_date)
    .eq("time", booking_time)
    .eq("is_available", true)
    .single();

  if (slotError || !slot) {
    throw new Error("Selected slot is no longer available");
  }

  // 3️⃣ Create booking with status = pending
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert([
      {
        customer_id: customer.id,
        service_id,
        booking_date,
        booking_time,
        total_price,
        downpayment,
        notes,
        status: "pending",
      },
    ])
    .select(
      `
      *,
      customers(*),
      services(name)
    `
    )
    .single();

  if (bookingError) throw new Error(bookingError.message);

  // 4️⃣ Block all slots globally for this date & time
  await blockSlotGlobally(booking_date, booking_time);

  return booking;
};

// ADMIN: get all bookings
// GUMAGANA NA TO
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
// GUMAGANA NA TO
export const approveBooking = async (id) => {
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "approved",
      approved_at: new Date(),
    })
    .eq("id", id)
    .eq("status", "pending");

  if (error) throw new Error(error.message);

  const { data, error: fetchError } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services(name),
      customers(full_name,email)
    `
    )
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  return data;
};

// ADMIN: reject booking
//GUMAGANA NA TO
export const rejectBooking = async (id) => {
  // STEP 1: update status
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "rejected",
    })
    .eq("id", id)
    .eq("status", "pending");

  if (error) throw new Error(error.message);

  // STEP 2: fetch full booking info
  const { data, error: fetchError } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services(name),
      customers(full_name, email)
    `
    )
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  await unblockSlotGlobally(data.booking_date, data.booking_time);

  return data;
};

// PUBLIC: cancel booking (24-hour rule)
// TODO: send email notification upon cancellation IMPLAMENTATION
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

  await unblockSlotGlobally(booking.booking_date, booking.booking_time);
  return data;
};
