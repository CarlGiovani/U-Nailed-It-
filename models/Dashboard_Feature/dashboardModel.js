import supabase from "../../utils/supabaseClient.js";

/* ===============================
   GET TOTAL BOOKINGS
=============================== */

export const getTotalBookings = async () => {
  const { count, error } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });

  if (error) throw new Error(error.message);

  return count;
};

/* ===============================
   GET TOTAL REVENUE
=============================== */

export const getTotalRevenue = async () => {
  const { data, error } = await supabase.from("revenue_logs").select("amount");

  if (error) throw new Error(error.message);

  const total = data?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;

  return total;
};

/* ===============================
   GET PENDING REVIEWS
=============================== */

export const getPendingReviews = async () => {
  const { count, error } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("is_approved", false);

  if (error) throw new Error(error.message);

  return count;
};

/* ===============================
   GET ACTIVE SERVICES
=============================== */

export const getActiveServices = async () => {
  const { count, error } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) throw new Error(error.message);

  return count;
};

/* ===============================
   BOOKING ANALYTICS
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
        (revenuePerMonth[month] || 0) + Number(b.total_price || 0);
    }
  });

  return {
    bookingsPerMonth,
    revenuePerMonth,
  };
};
