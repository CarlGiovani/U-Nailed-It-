import supabase from "../../utils/supabaseClient.js";

/* ===============================
   TOTAL BOOKINGS
=============================== */
export const getTotalBookings = async () => {
  const { count, error } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });

  if (error) throw new Error(error.message);

  return count || 0;
};

/* ===============================
   TOTAL REVENUE
=============================== */
export const getTotalRevenue = async () => {
  const { data, error } = await supabase
    .from("bookings")
    .select("total_price")
    .eq("status", "completed");

  if (error) throw new Error(error.message);

  const revenue = data?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

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
    .select("booking_date,total_price,status");

  if (error) throw new Error(error.message);

  const bookingsPerMonth = {};
  const revenuePerMonth = {};

  data.forEach((b) => {
    const month = new Date(b.booking_date).toLocaleString("default", {
      month: "short",
    });

    bookingsPerMonth[month] = (bookingsPerMonth[month] || 0) + 1;

    if (b.status === "completed") {
      revenuePerMonth[month] =
        (revenuePerMonth[month] || 0) + (b.total_price || 0);
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
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw new Error(error.message);

  return data || [];
};
