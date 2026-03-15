import supabase from "../../utils/supabaseClient.js";

const RECENT_BOOKING_STATUSES = ["pending_approval", "approved", "completed"];

const TOTAL_BOOKING_STATUSES = ["approved", "completed"];

const REVENUE_STATUS = "completed";

/* ===============================
   TOTAL BOOKINGS
=============================== */
export const getTotalBookings = async () => {
  const { count, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { count, error } = await supabase
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
  const { count, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
