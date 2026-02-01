import supabase from "../../utils/supabaseClient.js";
import {
  blockSlotGlobally,
  unblockSlotGlobally,
} from "../Calendar_Feature/calendarModel.js";
import { getOrCreateCustomer } from "../Customer_Feature/customerModel.js";

// PUBLIC: create booking with customer info (create customer if not exists) ALL IN ONE
// GUMAGANA NA TO, UPDATE: ngayon kasama na ang service_categories at variants

// STEP 1: Create booking pending payment (Customer chooses service/date/time)
export const createBookingWithCustomer = async (bookingData) => {
  const {
    service_id,
    service_category_id,
    service_variant_id,
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

  // Get or create customer
  const customer = await getOrCreateCustomer({
    full_name,
    email,
    phone,
    facebook_link,
  });

  // **Huwag muna i-check slot availability dito!**
  // Status: pending_payment
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert([
      {
        customer_id: customer.id,
        service_id,
        service_variant_id: service_variant_id || null,
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
      services(
        *,
        service_categories(
          id,
          name,
          service_variants(
            id,
            body_part,
            size,
            price,
            downpayment,
            is_active
          )
        )
      )
    `,
    )
    .single();

  if (bookingError) throw new Error(bookingError.message);

  // Filter response to only include selected category and variant
  if (service_category_id && service_variant_id && booking.services) {
    booking.services.service_categories = booking.services.service_categories
      .filter((cat) => cat.id === service_category_id)
      .map((cat) => {
        cat.service_variants = cat.service_variants.filter(
          (v) => v.id === service_variant_id,
        );
        return cat;
      });
  }

  // **Hindi na magbblock ng slot dito**
  return booking;
};

// STEP 3: Confirm booking after payment proof
// STEP 3: Confirm booking after payment proof with global block
export const createBookingWithPaymentIntent = async (intentId) => {
  const { data: intent } = await supabase
    .from("payment_intents")
    .select("*")
    .eq("id", intentId)
    .eq("status", "pending")
    .maybeSingle();

  if (!intent)
    throw new Error("Payment intent not found or already used/expired");

  // UTC-safe expiration check
  if (new Date(intent.expires_at).getTime() < new Date().getTime()) {
    await supabase
      .from("payment_intents")
      .update({ status: "expired" })
      .eq("id", intentId);
    throw new Error("Payment proof expired");
  }

  // Check slot availability for this service
  const { data: slot } = await supabase
    .from("calendar_slots")
    .select("id")
    .eq("service_id", intent.service_id)
    .eq("date", intent.booking_date)
    .eq("time", intent.booking_time)
    .eq("is_available", true)
    .maybeSingle();

  if (!slot) throw new Error("Selected slot is no longer available");

  // Lock the slot for this service
  await supabase
    .from("calendar_slots")
    .update({ is_available: false })
    .eq("id", slot.id);

  // Global block: block same date/time for ALL services
  await blockSlotGlobally(intent.booking_date, intent.booking_time);

  // Get or create customer
  const customer = await getOrCreateCustomer({ email: intent.email });

  // Update booking created in Step 1
  const { data: booking, error } = await supabase
    .from("bookings")
    .update({
      status: "pending", // or approved if auto-approve
      proof_payment_path: intent.proof_path,
    })
    .eq("id", intent.booking_id)
    .select("*")
    .single();

  if (error) {
    // Undo slot lock kung may error
    await supabase
      .from("calendar_slots")
      .update({ is_available: true })
      .eq("id", slot.id);
    throw new Error(error.message);
  }

  // Mark intent as used
  await supabase
    .from("payment_intents")
    .update({ status: "used" })
    .eq("id", intentId);

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
      services(
        *,
        service_categories(
          id,
          name,
          service_variants(
            id,
            body_part,
            size,
            price,
            downpayment,
            is_active
          )
        )
      ),
      customers(full_name,email)
    `,
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
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// ADMIN: approve booking
// GUMAGANA NA TO
export const approveBooking = async (id) => {
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({
      status: "approved",
      approved_at: new Date(),
    })
    .eq("id", id)
    .eq("status", "pending")
    .select()
    .single();

  if (error || !updated) {
    throw new Error("Booking cannot be approved");
  }

  const { data, error: fetchError } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services(
        *,
        service_categories(
          id,
          name,
          service_variants(
            id,
            body_part,
            size,
            price,
            downpayment,
            is_active
          )
        )
      ),
      customers(full_name,email)
    `,
    )
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  return data;
};

// ADMIN: reject booking
// GUMAGANA NA TO
export const rejectBooking = async (id) => {
  // STEP 1: update status
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({
      status: "rejected",
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("booking_date, booking_time")
    .single();

  if (error || !updated) {
    throw new Error("Booking cannot be rejected");
  }

  // STEP 2: unblock slot
  await unblockSlotGlobally(updated.booking_date, updated.booking_time);

  // STEP 3: fetch full booking info
  const { data, error: fetchError } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services(
        *,
        service_categories(
          id,
          name,
          service_variants(
            id,
            body_part,
            size,
            price,
            downpayment,
            is_active
          )
        )
      ),
      customers(full_name, email)
    `,
    )
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  return data;
};

// PUBLIC: cancel booking (24-hour rule)
// TODO: send email notification upon cancellation IMPLEMENTATION
export const cancelBooking = async (id) => {
  // get booking
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !booking) throw new Error("Booking not found");

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
