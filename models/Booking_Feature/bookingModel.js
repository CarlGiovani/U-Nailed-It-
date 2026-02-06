import supabase from "../../utils/supabaseClient.js";
import {
  blockSlotGlobally,
  unblockSlotGlobally,
} from "../Calendar_Feature/calendarModel.js";
import { getOrCreateCustomer } from "../Customer_Feature/customerModel.js";

/* ==========================================
   HELPER: filter selected variant ONLY
   - uses booking.service_variant_id
   - keeps only the category that contains that variant
========================================== */
const filterSelectedVariant = (booking) => {
  const vid = booking?.service_variant_id;
  if (!vid || !booking?.services?.service_categories) return booking;

  booking.services.service_categories = booking.services.service_categories
    .map((cat) => {
      const variants = (cat.service_variants || []).filter((v) => v.id === vid);
      return { ...cat, service_variants: variants };
    })
    .filter((cat) => cat.service_variants.length > 0);

  return booking;
};

/* ==========================================
   HELPER: safe unblock global (important!)
   - Only unblock if NO other active booking exists
========================================== */
const safeUnblockGlobalIfNoActiveBooking = async (date, time) => {
  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("booking_date", date)
    .eq("booking_time", time)
    .in("status", ["pending_approval", "approved"])
    .limit(1);

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) {
    await unblockSlotGlobally(date, time);
  }
};

/* ==========================================
   STEP 1: Create booking (pending_payment)
   - No slot blocking here
========================================== */
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

  const customer = await getOrCreateCustomer({
    full_name,
    email,
    phone,
    facebook_link,
  });

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
        status: "pending_payment",
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

  // keep your existing filter by selected category+variant (fine)
  if (service_category_id && service_variant_id && booking.services) {
    booking.services.service_categories = booking.services.service_categories
      .filter((cat) => cat.id === service_category_id)
      .map((cat) => {
        cat.service_variants = cat.service_variants.filter(
          (v) => v.id === service_variant_id,
        );
        return cat;
      });
  } else {
    // if not provided, still ensure 1 variant only based on service_variant_id
    filterSelectedVariant(booking);
  }

  return booking;
};

/* ==========================================
   STEP 3: Confirm booking using payment_intent
   - Atomic lock (first come first serve)
   - Block globally
   - booking status -> pending_approval
   - rollback if anything fails
========================================== */
export const createBookingWithPaymentIntent = async (intentId) => {
  // 1) fetch intent (must be pending)
  const { data: intent, error: intentErr } = await supabase
    .from("payment_intents")
    .select("*")
    .eq("id", intentId)
    .eq("status", "pending")
    .maybeSingle();

  if (intentErr) throw new Error(intentErr.message);
  if (!intent) throw new Error("Payment intent not found or already used/expired");

  // 2) expiry check
  if (new Date(intent.expires_at).getTime() < Date.now()) {
    await supabase
      .from("payment_intents")
      .update({ status: "expired" })
      .eq("id", intentId);

    throw new Error("Payment proof expired");
  }

  // 3) booking must be pending_payment
  const { data: bookingRow, error: bookingErr } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("id", intent.booking_id)
    .maybeSingle();

  if (bookingErr) throw new Error(bookingErr.message);
  if (!bookingRow) throw new Error("Booking not found");
  if (bookingRow.status !== "pending_payment") {
    throw new Error("Booking is not eligible for confirmation");
  }

  // 4) atomic lock the service slot
  const { data: lockedSlot, error: lockErr } = await supabase
    .from("calendar_slots")
    .update({ is_available: false })
    .eq("service_id", intent.service_id)
    .eq("date", intent.booking_date)
    .eq("time", intent.booking_time)
    .eq("is_available", true)
    .select("id")
    .maybeSingle();

  if (lockErr) throw new Error(lockErr.message);
  if (!lockedSlot) throw new Error("Selected slot is no longer available");

  try {
    // 5) global block
    await blockSlotGlobally(intent.booking_date, intent.booking_time);

    // 6) update booking -> pending_approval
    const { data: updatedBooking, error: updateErr } = await supabase
      .from("bookings")
      .update({
        status: "pending_approval",
        proof_payment_path: intent.proof_path,
      })
      .eq("id", intent.booking_id)
      .select("*")
      .single();

    if (updateErr) throw new Error(updateErr.message);

    // 7) mark intent used
    const { error: intentUsedErr } = await supabase
      .from("payment_intents")
      .update({ status: "used" })
      .eq("id", intentId);

    if (intentUsedErr) throw new Error(intentUsedErr.message);

    return updatedBooking;
  } catch (err) {
    // rollback service slot
    await supabase
      .from("calendar_slots")
      .update({ is_available: true })
      .eq("id", lockedSlot.id);

    // rollback global only if no other active booking exists
    await safeUnblockGlobalIfNoActiveBooking(intent.booking_date, intent.booking_time);

    throw err;
  }
};

/* ==========================================
   ADMIN: get all bookings
   NOTE: optional filtering per row to show only chosen variant
========================================== */
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

  // Optional: keep only selected variant in list (remove if admin wants to see all)
  return (data || []).map((b) => filterSelectedVariant(b));
};

/* ==========================================
   ADMIN: update booking status (generic)
========================================== */
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

/* ==========================================
   ADMIN: approve booking
   - return filtered selected variant only
========================================== */
export const approveBooking = async (id) => {
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({
      status: "approved",
      approved_at: new Date(),
    })
    .eq("id", id)
    .eq("status", "pending_approval")
    .select()
    .single();

  if (error || !updated) throw new Error("Booking cannot be approved");

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
  return filterSelectedVariant(data);
};

/* ==========================================
   ADMIN: reject booking
   - then safe unblock if no other active bookings
   - return filtered selected variant only
========================================== */
export const rejectBooking = async (id) => {
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({ status: "rejected" })
    .eq("id", id)
    .eq("status", "pending_approval")
    .select("booking_date, booking_time")
    .single();

  if (error || !updated) throw new Error("Booking cannot be rejected");

  await safeUnblockGlobalIfNoActiveBooking(updated.booking_date, updated.booking_time);

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
  return filterSelectedVariant(data);
};

/* ==========================================
   PUBLIC: cancel booking (24h rule)
   - then safe unblock if no other active bookings
========================================== */
export const cancelBooking = async (id) => {
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

  await safeUnblockGlobalIfNoActiveBooking(booking.booking_date, booking.booking_time);
  return data;
};

/* ==========================================
   PUBLIC: Get booking details by ID (Review page)
   - return filtered selected variant only
========================================== */
export const getBookingById = async (id) => {
  const bookingId = Number(id);
  if (!bookingId) throw new Error("Invalid booking id");

  const { data, error } = await supabase
    .from("bookings")
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
    .eq("id", bookingId)
    .single();

  if (error || !data) throw new Error("Booking not found");
  return filterSelectedVariant(data);
};

/* ==========================================
   PUBLIC: Confirm booking for a specific bookingId
   - validates intent belongs to booking
   - confirms via intent logic
   - returns full booking w/ joins (filtered)
========================================== */
export const confirmBookingForBookingId = async (bookingId, intentId) => {
  const bookingIdNum = Number(bookingId);
  if (!bookingIdNum) throw new Error("Invalid booking id");

  // 1) load intent (pending)
  const { data: intent, error: intentErr } = await supabase
    .from("payment_intents")
    .select("id, booking_id, status")
    .eq("id", intentId)
    .maybeSingle();

  if (intentErr) throw new Error(intentErr.message);
  if (!intent) throw new Error("Payment intent not found");
  if (intent.status !== "pending") throw new Error("Payment intent is not pending");

  // 2) SECURITY: ensure this intent is for THIS booking
  if (Number(intent.booking_id) !== bookingIdNum) {
    throw new Error("Payment intent does not match this booking");
  }

  // 3) proceed
  const updatedBooking = await createBookingWithPaymentIntent(intentId);

  // 4) return full booking (filtered)
  return await getBookingById(updatedBooking.id);
};




/* ==========================================
   ADMIN: complete booking
   - only approved bookings can be completed
   - sets completed_at
========================================== */

export const completeBooking = async (id) => {
  const bookingId = Number(id)
  if(!bookingId) throw new Error("Invalid Booking Id");

  // update status -> completed (only if currently approved)
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({
      status: "completed",
      completed_at: new Date(),
    })
    .eq("id", bookingId)
    .eq("status", "approved")
    .select()
    .single();

  if (error || !updated) throw new Error("Booking cannot be completed");

  // return full booking with joins (same pattern ng approve/reject)
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
    .eq("id", bookingId)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  return filterSelectedVariant(data);
  
}