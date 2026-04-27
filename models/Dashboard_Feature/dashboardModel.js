import { supabaseAdmin } from "../../utils/supabaseClient.js";

const RECENT_BOOKING_STATUSES = ["pending_approval", "approved", "completed"];
const TOTAL_BOOKING_STATUSES = ["approved", "completed"];
const REVENUE_STATUS = "completed";

/* ===============================
   TOTAL BOOKINGS
=============================== */
export const getTotalBookings = async () => {
  const { count, error } = await supabaseAdmin
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .in("status", TOTAL_BOOKING_STATUSES);

  if (error) throw new Error(error.message);

  return count || 0;
};

/* ===============================
   BOOKING COUNTS BY STATUS
=============================== */
export const getBookingStatusCounts = async () => {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("status")
    .in("status", RECENT_BOOKING_STATUSES);

  if (error) throw new Error(error.message);

  const counts = {
    pending_approval: 0,
    approved: 0,
    completed: 0,
  };

  data.forEach((booking) => {
    if (counts[booking.status] !== undefined) {
      counts[booking.status] += 1;
    }
  });

  return counts;
};

/* ===============================
   TOTAL REVENUE
=============================== */
export const getTotalRevenue = async () => {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("total_price")
    .eq("status", REVENUE_STATUS);

  if (error) throw new Error(error.message);

  const revenue =
    data?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;

  return revenue;
};

/* ===============================
   PENDING REVIEWS
=============================== */
export const getPendingReviews = async () => {
  const { count, error } = await supabaseAdmin
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("is_approved", false);

  if (error) throw new Error(error.message);

  return count || 0;
};

/* ===============================
   ACTIVE SERVICES
=============================== */
export const getActiveServices = async () => {
  const { count, error } = await supabaseAdmin
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) throw new Error(error.message);

  return count || 0;
};

/* ===============================
   ANALYTICS
=============================== */
export const getBookingAnalytics = async () => {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("booking_date,total_price,status")
    .in("status", TOTAL_BOOKING_STATUSES);

  if (error) throw new Error(error.message);

  const bookingsPerMonth = {};
  const revenuePerMonth = {};

  data.forEach((booking) => {
    const month = new Date(booking.booking_date).toLocaleString("default", {
      month: "short",
    });

    bookingsPerMonth[month] = (bookingsPerMonth[month] || 0) + 1;

    if (booking.status === REVENUE_STATUS) {
      revenuePerMonth[month] =
        (revenuePerMonth[month] || 0) + (booking.total_price || 0);
    }
  });

  return {
    bookingsPerMonth,
    revenuePerMonth,
  };
};

/* ===============================
   RECENT BOOKINGS
=============================== */
export const getRecentBookings = async () => {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      `
      id,
      booking_date,
      status,
      customers(full_name),
      services(name)
    `,
    )
    .in("status", RECENT_BOOKING_STATUSES)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);

  return data || [];
};

/* ===============================
   BLOCK CUSTOMER BY EMAIL
=============================== */
export const blockCustomerByEmail = async ({ email, reason, adminId }) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // exact match first
  let { data, error } = await supabaseAdmin
    .from("customers")
    .update({
      is_blocked: true,
      blocked_reason: reason || "Blocked by admin",
      blocked_at: new Date().toISOString(),
      blocked_by: adminId || null,
    })
    .eq("email", normalizedEmail)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);

  // fallback: case-insensitive match
  if (!data) {
    const fallback = await supabaseAdmin
      .from("customers")
      .update({
        is_blocked: true,
        blocked_reason: reason || "Blocked by admin",
        blocked_at: new Date().toISOString(),
        blocked_by: adminId || null,
      })
      .ilike("email", normalizedEmail)
      .select("*")
      .maybeSingle();

    if (fallback.error) throw new Error(fallback.error.message);
    data = fallback.data;
  }

  if (!data) {
    throw new Error("Customer not found");
  }

  return data;
};

/* ===============================
   UNBLOCK CUSTOMER BY EMAIL
=============================== */
export const unblockCustomerById = async ({ customer_id }) => {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .update({
      is_blocked: false,
      blocked_reason: null,
      blocked_at: null,
      blocked_by: null,
    })
    .eq("id", customer_id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Customer not found");

  return data;
};
export const getSystemExportData = async () => {
  const [
    bookingsRes,
    customersRes,
    servicesRes,
    categoriesRes,
    variantsRes,
    reviewsRes,
    notificationsRes,
    revenueLogsRes,
    announcementsRes,
    policiesRes,
    calendarSlotsRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("bookings")
      .select(
        `
      id,
      customer_id,
      service_id,
      service_variant_id,
      booking_date,
      booking_time,
      total_price,
      downpayment,
      notes,
      proof_payment_path,
      status,
      created_at,
      updated_at,
      approved_at,
      cancelled_at,
      completed_at,
      expires_at,
      review_token,
      cancel_token,
      cancellation_reason,
      customer_name,
      customer_email,
      customer_phone,
      customer_facebook_link,
      customers(full_name, email, phone, facebook_link),
      services(name),
      service_variants(body_part, size, price, downpayment)
    `,
      )
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("services")
      .select("*")
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("service_categories")
      .select("*")
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("service_variants")
      .select("*")
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("reviews")
      .select(
        `
      *,
      bookings(id, booking_date, status)
    `,
      )
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("revenue_logs")
      .select(
        `
      *,
      bookings(id, booking_date, status)
    `,
      )
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("policies")
      .select("*")
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("calendar_slots")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const responses = [
    bookingsRes,
    customersRes,
    servicesRes,
    categoriesRes,
    variantsRes,
    reviewsRes,
    notificationsRes,
    revenueLogsRes,
    announcementsRes,
    policiesRes,
    calendarSlotsRes,
  ];

  for (const res of responses) {
    if (res.error) {
      throw new Error(res.error.message);
    }
  }

  return {
    bookings: bookingsRes.data || [],
    customers: customersRes.data || [],
    services: servicesRes.data || [],
    serviceCategories: categoriesRes.data || [],
    serviceVariants: variantsRes.data || [],
    reviews: reviewsRes.data || [],
    notifications: notificationsRes.data || [],
    revenueLogs: revenueLogsRes.data || [],
    announcements: announcementsRes.data || [],
    policies: policiesRes.data || [],
    calendarSlots: calendarSlotsRes.data || [],
  };
};
