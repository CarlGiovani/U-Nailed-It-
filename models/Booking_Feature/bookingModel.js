import crypto from "crypto";
import supabase from "../../utils/supabaseClient.js";
import { unblockSlotGlobally } from "../Calendar_Feature/calendarModel.js";
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

  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  /* ==========================================
     BLOCKED EMAIL CHECK
  ========================================== */
  const { data: blockedCustomer, error: blockedCheckError } = await supabase
    .from("customers")
    .select("id, full_name, email, is_blocked, blocked_reason")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (blockedCheckError) {
    throw new Error(blockedCheckError.message);
  }

  if (blockedCustomer?.is_blocked) {
    throw new Error(
      blockedCustomer.blocked_reason ||
        "This email is currently restricted from making new bookings due to repeated cancellations.",
    );
  }

  const customer = await getOrCreateCustomer({
    full_name,
    email: normalizedEmail,
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
        customer_email: normalizedEmail,
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
        customer_email: normalizedEmail,
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
  // 1) Load pending intent
  const { data: intent, error: intentErr } = await supabase
    .from("payment_intents")
    .select("*")
    .eq("id", intentId)
    .eq("status", "pending")
    .maybeSingle();

  if (intentErr) throw new Error(intentErr.message);
  if (!intent) {
    throw new Error("Payment intent not found or already used/expired");
  }

  // 2) Expiry check
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

  // 3) Load booking
  const { data: bookingRow, error: bookingErr } = await supabase
    .from("bookings")
    .select("id, status, booking_date, booking_time")
    .eq("id", intent.booking_id)
    .maybeSingle();

  if (bookingErr) throw new Error(bookingErr.message);
  if (!bookingRow) throw new Error("Booking not found");

  if (bookingRow.status !== "pending_payment") {
    throw new Error("Booking is not eligible for confirmation");
  }

  // 4) Soft pre-check for existing active booking on same global slot
  //    (helpful message, but DB unique index is still the real protection)
  const { data: existingActive, error: existingActiveErr } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("booking_date", intent.booking_date)
    .eq("booking_time", intent.booking_time)
    .in("status", ["pending_approval", "approved"])
    .neq("id", intent.booking_id)
    .limit(1)
    .maybeSingle();

  if (existingActiveErr) throw new Error(existingActiveErr.message);

  if (existingActive) {
    throw new Error("Selected slot is no longer available");
  }

  // 5) Update all same date+time calendar slots globally to unavailable first
  //    so UI/service slots reflect the real business rule
  const { error: globalBlockErr } = await supabase
    .from("calendar_slots")
    .update({ is_available: false })
    .eq("date", intent.booking_date)
    .eq("time", intent.booking_time);

  if (globalBlockErr) throw new Error(globalBlockErr.message);

  // 6) Confirm booking
  //    IMPORTANT: the DB unique index is what prevents double booking here.
  const pendingCancelToken = crypto.randomUUID();

  const { data: updatedBooking, error: updateErr } = await supabase
    .from("bookings")
    .update({
      status: "pending_approval",
      proof_payment_path: intent.proof_path,
      pending_cancel_token: pendingCancelToken,
    })
    .eq("id", intent.booking_id)
    .eq("status", "pending_payment")
    .select("*")
    .single();

  if (updateErr) {
    // PostgreSQL unique violation
    if (updateErr.code === "23505") {
      throw new Error("Selected slot is no longer available");
    }
    throw new Error(updateErr.message);
  }

  // 7) Mark intent used
  const { error: intentUsedErr } = await supabase
    .from("payment_intents")
    .update({ status: "used" })
    .eq("id", intentId)
    .eq("status", "pending");

  if (intentUsedErr) {
    // rollback booking status if marking intent fails
    await supabase
      .from("bookings")
      .update({
        status: "pending_payment",
        proof_payment_path: null,
        pending_cancel_token: null,
      })
      .eq("id", intent.booking_id)
      .eq("status", "pending_approval");

    await safeUnblockGlobalIfNoActiveBooking(
      intent.booking_date,
      intent.booking_time,
    );

    throw new Error(intentUsedErr.message);
  }

  return updatedBooking;
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
      approved_at: new Date().toISOString(),
      cancel_token: cancelToken,
      pending_cancel_token: null,
    })
    .eq("id", id)
    .eq("status", "pending_approval")
    .select()
    .maybeSingle();

  console.log("[approveBooking] id:", id);
  console.log("[approveBooking] updated:", updated);
  console.log("[approveBooking] error:", error);

  if (error) {
    throw new Error(`Approve failed: ${error.message}`);
  }

  if (!updated) {
    throw new Error(
      "Approve failed: no booking row was updated. Possible RLS/policy issue or stale booking state.",
    );
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
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!data) throw new Error("Approved booking not found after update");

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
    .update({
      status: "rejected",
      pending_cancel_token: null,
    })
    .eq("id", id)
    .eq("status", "pending_approval")
    .select("booking_date, booking_time")
    .maybeSingle();

  console.log("[rejectBooking] id:", id);
  console.log("[rejectBooking] updated:", updated);
  console.log("[rejectBooking] error:", error);

  if (error) {
    throw new Error(`Reject failed: ${error.message}`);
  }

  if (!updated) {
    throw new Error(
      "Reject failed: no booking row was updated. Possible RLS/policy issue or stale booking state.",
    );
  }

  await safeUnblockGlobalIfNoActiveBooking(
    updated.booking_date,
    updated.booking_time,
  );

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
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!data) throw new Error("Rejected booking not found after update");

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

  const now = new Date();

  const appointmentDateTime = new Date(
    `${booking.booking_date}T${booking.booking_time}`,
  );

  if (appointmentDateTime < now) {
    throw new Error("Cannot cancel past appointments");
  }

  const hoursBeforeAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);

  if (hoursBeforeAppointment < 24) {
    throw new Error(
      "Cancellation is only allowed up to 24 hours before the appointment",
    );
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
   PUBLIC: cancel pending approval booking by id
   - only pending_approval
   - then safe unblock if no other active bookings
========================================== */
export const cancelPendingApprovalBookingById = async (
  bookingId,
  reason,
  customerEmail,
) => {
  const id = Number(bookingId);
  if (!id) throw new Error("Invalid booking id");

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "pending_approval") {
    throw new Error("Only pending approval bookings can be cancelled");
  }

  const now = new Date();

  const appointmentDateTime = new Date(
    `${booking.booking_date}T${booking.booking_time}`,
  );

  if (appointmentDateTime <= now) {
    throw new Error("Cannot cancel past appointments");
  }

  if (
    customerEmail &&
    booking.customer_email &&
    booking.customer_email.toLowerCase() !== customerEmail.toLowerCase()
  ) {
    throw new Error("Booking verification failed");
  }

  const { data: cancelled, error: cancelError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: now.toISOString(),
      cancellation_reason: reason || null,
    })
    .eq("id", id)
    .eq("status", "pending_approval")
    .select("id")
    .single();

  if (cancelError) throw new Error(cancelError.message);

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
   PUBLIC: cancel pending approval booking by token
   - only pending_approval
   - then safe unblock if no other active bookings
========================================== */
export const cancelPendingApprovalBookingByToken = async (token, reason) => {
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("pending_cancel_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!booking) {
    throw new Error("Invalid or expired pending cancellation link");
  }

  if (booking.status !== "pending_approval") {
    throw new Error("Only pending approval bookings can be cancelled");
  }

  const now = new Date();
  const appointmentDateTime = new Date(
    `${booking.booking_date}T${booking.booking_time}`,
  );

  if (appointmentDateTime <= now) {
    throw new Error("Cannot cancel past appointments");
  }

  const { data: cancelled, error: cancelError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: now.toISOString(),
      cancellation_reason: reason || null,
      pending_cancel_token: null,
    })
    .eq("id", booking.id)
    .eq("status", "pending_approval")
    .eq("pending_cancel_token", token)
    .select("id")
    .maybeSingle();

  if (cancelError) throw new Error(cancelError.message);

  if (!cancelled) {
    throw new Error(
      "This booking can no longer be cancelled. It may have already been updated.",
    );
  }

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
    .eq("id", booking.id)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!fullBooking) throw new Error("Cancelled booking not found");

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

  const reviewToken = crypto.randomUUID();
  const completedAt = new Date().toISOString();

  // update booking status -> completed
  const { data: updated, error } = await supabase
    .from("bookings")
    .update({
      status: "completed",
      completed_at: completedAt,
      review_token: reviewToken,
    })
    .eq("id", bookingId)
    .eq("status", "approved")
    .select()
    .single();

  if (error || !updated) {
    throw new Error("Booking cannot be completed");
  }

  // insert revenue log
  const { error: revenueError } = await supabase.from("revenue_logs").insert([
    {
      booking_id: updated.id,
      amount: updated.total_price,
      note: "Revenue recorded from completed booking",
    },
  ]);

  if (revenueError) {
    throw new Error(revenueError.message);
  }

  // return full booking with joins
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
