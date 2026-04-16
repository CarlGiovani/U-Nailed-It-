import { getAllAdmins } from "../../models/Admin_Gmail_Notif_Feature/adminGmailNotifModel.js";
import * as monthlyReportModel from "../../models/Reports_Feature/monthlyReportModel.js";
import { adminMonthlyReportTemplate } from "../../templates/emails/adminMonthlyReportTemplate.js";
import { supabaseAdmin } from "../../utils/supabaseClient.js";
import sendEmail from "../Email_Feature/emailService.js";

const getPreviousMonthRange = () => {
  const now = new Date();

  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayPreviousMonth = new Date(firstDayCurrentMonth - 1);
  const firstDayPreviousMonth = new Date(
    lastDayPreviousMonth.getFullYear(),
    lastDayPreviousMonth.getMonth(),
    1,
  );

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    report_month: lastDayPreviousMonth.getMonth() + 1,
    report_year: lastDayPreviousMonth.getFullYear(),
    period_start: formatDate(firstDayPreviousMonth),
    period_end: formatDate(lastDayPreviousMonth),
    label: lastDayPreviousMonth.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    }),
  };
};

const buildTopServices = (bookings = []) => {
  const counts = {};

  bookings.forEach((booking) => {
    const serviceName = booking?.services?.name || "Unknown Service";
    counts[serviceName] = (counts[serviceName] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

const createAdminNotifications = async ({
  admins,
  title,
  message,
  link,
  related_entity,
  related_id,
}) => {
  if (!Array.isArray(admins) || admins.length === 0) return [];

  const createdNotifications = [];

  for (const admin of admins) {
    if (!admin?.id) continue;

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        admin_id: admin.id,
        type: "monthly_report",
        title,
        message,
        link: link || null,
        related_entity: related_entity || null,
        related_id: related_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error(
        `FAILED TO CREATE MONTHLY REPORT NOTIFICATION FOR ADMIN ${admin.id}:`,
        error.message,
      );
      continue;
    }

    createdNotifications.push(data);
  }

  return createdNotifications;
};

export const generateMonthlyReport = async () => {
  const period = getPreviousMonthRange();

  const existing = await monthlyReportModel.getMonthlyReportByPeriod({
    report_month: period.report_month,
    report_year: period.report_year,
  });

  if (existing) {
    return {
      skipped: true,
      message: "Monthly report already exists for this period.",
      report: existing,
    };
  }

  const [bookings, revenueLogs, customers, reviews] = await Promise.all([
    monthlyReportModel.getMonthlyBookings({
      startDate: period.period_start,
      endDate: period.period_end,
    }),
    monthlyReportModel.getMonthlyRevenueLogs({
      startDate: period.period_start,
      endDate: period.period_end,
    }),
    monthlyReportModel.getMonthlyCustomers({
      startDate: period.period_start,
      endDate: period.period_end,
    }),
    monthlyReportModel.getMonthlyReviews({
      startDate: period.period_start,
      endDate: period.period_end,
    }),
  ]);

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(
    (item) => item.status === "completed",
  ).length;
  const cancelledBookings = bookings.filter(
    (item) => item.status === "cancelled",
  ).length;
  const totalRevenue = revenueLogs.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
  const totalCustomers = customers.length;
  const totalReviews = reviews.length;
  const topServices = buildTopServices(bookings);

  const summary_json = {
    label: period.label,
    period_start: period.period_start,
    period_end: period.period_end,
    totalBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue,
    totalCustomers,
    totalReviews,
    topServices,
  };

  const inserted = await monthlyReportModel.insertMonthlyReport({
    report_month: period.report_month,
    report_year: period.report_year,
    period_start: period.period_start,
    period_end: period.period_end,
    report_type: "monthly",
    status: "generated",
    total_bookings: totalBookings,
    completed_bookings: completedBookings,
    cancelled_bookings: cancelledBookings,
    total_revenue: totalRevenue,
    total_customers: totalCustomers,
    total_reviews: totalReviews,
    summary_json,
  });

  const admins = await getAllAdmins();
  const recipients = admins
    .map((admin) => admin?.email?.trim())
    .filter(Boolean);

  const frontendUrl = process.env.ADMIN_FRONTEND_URL || "http://localhost:5174";
  const reportLink = `${frontendUrl}/admin/dashboard`;

  const notifTitle = `Monthly Report Ready - ${period.label}`;
  const notifMessage = `The monthly report for ${period.label} has been generated successfully.`;

  await createAdminNotifications({
    admins,
    title: notifTitle,
    message: notifMessage,
    link: "/admin/dashboard",
    related_entity: "monthly_reports",
    related_id: inserted.id,
  });

let updatedReport = null;

if (recipients.length > 0) {
  await sendEmail({
    to: recipients.join(", "),
    subject: `UNAILEDIT Monthly Report - ${period.label}`,
    html: adminMonthlyReportTemplate({
      label: period.label,
      periodStart: period.period_start,
      periodEnd: period.period_end,
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      totalCustomers,
      totalReviews,
      topServices,
      openLink: reportLink,
    }),
  });

  updatedReport =
    await monthlyReportModel.updateMonthlyReportEmailStatus({
      id: inserted.id,
      emailed_to: recipients.join(", "),
    });
}

  return {
    skipped: false,
    message:
      recipients.length > 0
        ? "Monthly report generated and emailed to admins successfully."
        : "Monthly report generated successfully, but no admin emails were found.",
    report: updatedReport || inserted,
    recipients,
  };
};

export const getMonthlyReports = async () => {
  return await monthlyReportModel.listMonthlyReports();
};
