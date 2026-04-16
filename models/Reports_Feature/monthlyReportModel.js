import { supabaseAdmin } from "../../utils/supabaseClient.js";

export const getMonthlyBookings = async ({ startDate, endDate }) => {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      `
      id,
      status,
      total_price,
      booking_date,
      booking_time,
      created_at,
      cancelled_at,
      completed_at,
      customer_id,
      customer_name,
      customer_email,
      services(name),
      service_variants(body_part, size)
    `,
    )
    .gte("booking_date", startDate)
    .lte("booking_date", endDate)
    .order("booking_date", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const getMonthlyRevenueLogs = async ({ startDate, endDate }) => {
  const { data, error } = await supabaseAdmin
    .from("revenue_logs")
    .select("id, amount, note, created_at, booking_id")
    .gte("created_at", `${startDate}T00:00:00.000Z`)
    .lte("created_at", `${endDate}T23:59:59.999Z`)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const getMonthlyCustomers = async ({ startDate, endDate }) => {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("id, full_name, email, created_at")
    .gte("created_at", `${startDate}T00:00:00.000Z`)
    .lte("created_at", `${endDate}T23:59:59.999Z`)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const getMonthlyReviews = async ({ startDate, endDate }) => {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("id, rating, comment, is_approved, created_at, booking_id")
    .gte("created_at", `${startDate}T00:00:00.000Z`)
    .lte("created_at", `${endDate}T23:59:59.999Z`)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const getMonthlyReportByPeriod = async ({
  report_month,
  report_year,
}) => {
  const { data, error } = await supabaseAdmin
    .from("monthly_reports")
    .select("*")
    .eq("report_month", report_month)
    .eq("report_year", report_year)
    .eq("report_type", "monthly")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export const insertMonthlyReport = async (payload) => {
  const { data, error } = await supabaseAdmin
    .from("monthly_reports")
    .insert([
      {
        ...payload,
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export const updateMonthlyReportEmailStatus = async ({ id, emailed_to }) => {
  const { data, error } = await supabaseAdmin
    .from("monthly_reports")
    .update({
      emailed_to,
      emailed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export const listMonthlyReports = async () => {
  const { data, error } = await supabaseAdmin
    .from("monthly_reports")
    .select("*")
    .order("report_year", { ascending: false })
    .order("report_month", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};
