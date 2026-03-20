import crypto from "crypto";
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

  const nowIso = new Date().toISOString();

  // 1) Check if may existing ACTIVE pending_payment booking for same slot/service/customer
  const { data: existing, error: existingErr } = await supabase
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
    .eq("customer_id", customer.id)
    .eq("service_id", service_id)
    .eq("booking_date", booking_date)
    .eq("booking_time", booking_time)
    .eq("status", "pending_payment")
    .gt("expires_at", nowIso)
    .maybeSingle();

  if (existingErr) throw new Error(existingErr.message);

  // If exists, reuse it but refresh snapshot fields
  if (existing) {
    const { data: refreshedBooking, error: refreshError } = await supabase
      .from("bookings")
      .update({
        customer_name: full_name,
        customer_email: email,
        customer_phone: phone,
        customer_facebook_link: facebook_link,
        service_variant_id: service_variant_id || null,
        total_price,
        downpayment,
        notes,
      })
      .eq("id", existing.id)
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

    if (refreshError) throw new Error(refreshError.message);

    if (
      service_category_id &&
      service_variant_id &&
      refreshedBooking.services
    ) {
      refreshedBooking.services.service_categories =
        refreshedBooking.services.service_categories
          .filter((cat) => cat.id === service_category_id)
          .map((cat) => {
            cat.service_variants = cat.service_variants.filter(
              (v) => v.id === service_variant_id,
            );
            return cat;
          });
    } else {
      filterSelectedVariant(refreshedBooking);
    }

    return refreshedBooking;
  }

  // 2) Create new booking if none found
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert([
      {
        customer_id: customer.id,
        customer_name: full_name,
        customer_email: email,
        customer_phone: phone,
        customer_facebook_link: facebook_link,
        service_id,
        service_variant_id: service_variant_id || null,
        booking_date,
        booking_time,
        total_price,
        downpayment,
        notes,
        status: "pending_payment",
        expires_at: expiresAt,
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
  // fetch intent dapat pending pa, and get booking_id from there
  const { data: intent, error: intentErr } = await supabase
    .from("payment_intents")
    .select("*")
    .eq("id", intentId)
    .eq("status", "pending")
    .maybeSingle();

  if (intentErr) throw new Error(intentErr.message);
  if (!intent)
    throw new Error("Payment intent not found or already used/expired");

  // expiry check
  if (new Date(intent.expires_at).getTime() < Date.now()) {
    const { error: intentExpireError } = await supabase
      .from("payment_intents")
      .update({ status: "expired" })
      .eq("id", intentId);

    if (intentExpireError) throw new Error(intentExpireError.message);

    const { error: bookingExpireError } = await supabase
      .from("bookings")
      .update({ status: "expired" })
      .eq("id", intent.booking_id)
      .eq("status", "pending_payment");

    if (bookingExpireError) throw new Error(bookingExpireError.message);

    throw new Error("Payment proof expired");
  }

  // booking must be pending_payment
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

  // atomic lock the service slot
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
    // global block
    await blockSlotGlobally(intent.booking_date, intent.booking_time);

    // update booking -> pending_approval
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

    // mark intent used
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
    await safeUnblockGlobalIfNoActiveBooking(
      intent.booking_date,
      intent.booking_time,
    );

    throw err;
  }
};

/* ==========================================
   ADMIN: get all bookings
   NOTE: optional filtering per row to show only chosen variant
========================================== */
export const getAllBookings = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  dateFrom = "",
  dateTo = "",
  sortBy = "created_at",
  order = "desc",
}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 10);

  const allowedSortFields = [
    "created_at",
    "booking_date",
    "status",
    "approved_at",
    "completed_at",
    "cancelled_at",
  ];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";

  const safeOrder = order === "asc" ? "asc" : "desc";

  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = supabase
    .from("bookings")
    .select(
      `
      *,
      services(
        id,
        name
      ),
      customers(
        id,
        full_name,
        email,
        phone,
        facebook_link
      ),
      service_variants(
        id,
        body_part,
        size,
        price,
        downpayment,
        service_categories(
          id,
          name
        )
      )
      `,
      { count: "exact" },
    )
    .order(safeSortBy, { ascending: safeOrder === "asc" })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search?.trim()) {
    const keyword = search.trim();

    query = query.or(
      `customer_name.ilike.%${keyword}%,customer_email.ilike.%${keyword}%`,
    );

    query = query.or(`full_name.ilike.%${keyword}%,email.ilike.%${keyword}%`, {
      referencedTable: "customers",
    });
  }

  if (dateFrom) {
    query = query.gte("booking_date", dateFrom);
  }

  if (dateTo) {
    query = query.lte("booking_date", dateTo);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    data: data || [],
    total: count || 0,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil((count || 0) / safeLimit),
  };
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
  const cancelToken = crypto.randomUUID();
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({
      status: "approved",
      approved_at: new Date(),
      cancel_token: cancelToken,
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
    .select("booking_date, booking_time, service_id")
    .single();

  if (error || !updated) throw new Error("Booking cannot be rejected");

  // RELEASE SERVICE SLOT
  await supabase
    .from("calendar_slots")
    .update({ is_available: true })
    .eq("service_id", updated.service_id)
    .eq("date", updated.booking_date)
    .eq("time", updated.booking_time);

  // SAFE UNBLOCK GLOBAL (if no other active booking)
  await safeUnblockGlobalIfNoActiveBooking(
    updated.booking_date,
    updated.booking_time,
  );

  // (rest stays the same)
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
export const cancelBookingByToken = async (token, reason) => {
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("cancel_token", token)
    .single();

  if (error || !booking) {
    throw new Error("Invalid or expired cancellation link");
  }

  if (booking.status !== "approved") {
    throw new Error("Only approved bookings can be cancelled");
  }

  if (!booking.approved_at) {
    throw new Error("Booking approval time is missing");
  }

  const now = new Date();

  const appointmentDateTime = new Date(
    `${booking.booking_date}T${booking.booking_time}`,
  );

  if (appointmentDateTime < now) {
    throw new Error("Cannot cancel past appointments");
  }

  const approvedTime = new Date(booking.approved_at);
  const diffHours = (now - approvedTime) / (1000 * 60 * 60);

  if (diffHours > 24) {
    throw new Error("Cancellation period expired (24 hours)");
  }

  const { data: cancelled, error: cancelError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: now.toISOString(),
      cancel_token: null,
      cancellation_reason: reason || null,
    })
    .eq("id", booking.id)
    .eq("status", "approved")
    .eq("cancel_token", token)
    .select("id")
    .single();

  if (cancelError) throw new Error(cancelError.message);

  const { error: slotError } = await supabase
    .from("calendar_slots")
    .update({ is_available: true })
    .eq("service_id", booking.service_id)
    .eq("date", booking.booking_date)
    .eq("time", booking.booking_time);

  if (slotError) throw new Error(slotError.message);

  await safeUnblockGlobalIfNoActiveBooking(
    booking.booking_date,
    booking.booking_time,
  );

  const { data: fullBooking, error: fetchError } = await supabase
    .from("bookings")
    .select(
      `
      *,
      services (
        id,
        name
      ),
      customers (
        id,
        full_name,
        email
      )
    `,
    )
    .eq("id", cancelled.id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  return fullBooking;
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
  if (intent.status !== "pending")
    throw new Error("Payment intent is not pending");

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
  const bookingId = Number(id);
  if (!bookingId) throw new Error("Invalid Booking Id");

  //  generate review token
  const reviewToken = crypto.randomUUID();

  // update status -> completed (only if currently approved)
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      review_token: reviewToken,
    })
    .eq("id", bookingId)
    .eq("status", "approved")
    .select()
    .single();

  if (error || !updated) {
    throw new Error("Booking cannot be completed");
  }

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
};
