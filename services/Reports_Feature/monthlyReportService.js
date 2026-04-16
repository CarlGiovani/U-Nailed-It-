import { getAllAdmins } from "../../models/Admin_Gmail_Notif_Feature/adminGmailNotifModel.js";
import * as monthlyReportModel from "../../models/Reports_Feature/monthlyReportModel.js";
import { adminMonthlyReportTemplate } from "../../templates/emails/adminMonthlyReportTemplate.js";
import { generateMonthlyReportPdf } from "../../utils/generateMonthlyReportPDF.js";
import { supabaseAdmin } from "../../utils/supabaseClient.js";
import sendEmail from "../Email_Feature/emailService.js";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPreviousMonthRange = () => {
  const now = new Date();
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayPreviousMonth = new Date(firstDayCurrentMonth - 1);
  const firstDayPreviousMonth = new Date(
    lastDayPreviousMonth.getFullYear(),
    lastDayPreviousMonth.getMonth(),
    1,
  );

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

const getMonthBeforeRange = (currentPeriod) => {
  const date = new Date(currentPeriod.period_start);

  const firstDayPrev = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const lastDayPrev = new Date(date.getFullYear(), date.getMonth(), 0);

  return {
    period_start: formatDate(firstDayPrev),
    period_end: formatDate(lastDayPrev),
    label: firstDayPrev.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    }),
  };
};

const getGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
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
  const previousPeriod = getMonthBeforeRange(period);

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

  const [
    bookings,
    revenueLogs,
    customers,
    reviews,
    prevBookings,
    prevRevenueLogs,
    prevCustomers,
    prevReviews,
  ] = await Promise.all([
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

    monthlyReportModel.getPreviousMonthBookings({
      startDate: previousPeriod.period_start,
      endDate: previousPeriod.period_end,
    }),
    monthlyReportModel.getPreviousMonthRevenueLogs({
      startDate: previousPeriod.period_start,
      endDate: previousPeriod.period_end,
    }),
    monthlyReportModel.getPreviousMonthCustomers({
      startDate: previousPeriod.period_start,
      endDate: previousPeriod.period_end,
    }),
    monthlyReportModel.getPreviousMonthReviews({
      startDate: previousPeriod.period_start,
      endDate: previousPeriod.period_end,
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

  const prevTotalBookings = prevBookings.length;
  const prevCompletedBookings = prevBookings.filter(
    (item) => item.status === "completed",
  ).length;
  const prevCancelledBookings = prevBookings.filter(
    (item) => item.status === "cancelled",
  ).length;
  const prevTotalRevenue = prevRevenueLogs.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
  const prevTotalCustomers = prevCustomers.length;
  const prevTotalReviews = prevReviews.length;

  const bookingsGrowth = getGrowth(totalBookings, prevTotalBookings);
  const revenueGrowth = getGrowth(totalRevenue, prevTotalRevenue);
  const completedGrowth = getGrowth(completedBookings, prevCompletedBookings);
  const cancelledGrowth = getGrowth(cancelledBookings, prevCancelledBookings);
  const customersGrowth = getGrowth(totalCustomers, prevTotalCustomers);
  const reviewsGrowth = getGrowth(totalReviews, prevTotalReviews);

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
    comparison: {
      previousLabel: previousPeriod.label,
      previousPeriodStart: previousPeriod.period_start,
      previousPeriodEnd: previousPeriod.period_end,
      previousTotalBookings: prevTotalBookings,
      previousCompletedBookings: prevCompletedBookings,
      previousCancelledBookings: prevCancelledBookings,
      previousTotalRevenue: prevTotalRevenue,
      previousTotalCustomers: prevTotalCustomers,
      previousTotalReviews: prevTotalReviews,
      bookingsGrowth,
      revenueGrowth,
      completedGrowth,
      cancelledGrowth,
      customersGrowth,
      reviewsGrowth,
    },
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

  const pdf = await generateMonthlyReportPdf({
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
    comparison: {
      previousLabel: previousPeriod.label,
      previousTotalBookings: prevTotalBookings,
      previousCompletedBookings: prevCompletedBookings,
      previousCancelledBookings: prevCancelledBookings,
      previousTotalRevenue: prevTotalRevenue,
      previousTotalCustomers: prevTotalCustomers,
      previousTotalReviews: prevTotalReviews,
      bookingsGrowth,
      revenueGrowth,
      completedGrowth,
      cancelledGrowth,
      customersGrowth,
      reviewsGrowth,
    },
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
        comparison: {
          previousLabel: previousPeriod.label,
          previousTotalBookings: prevTotalBookings,
          previousCompletedBookings: prevCompletedBookings,
          previousCancelledBookings: prevCancelledBookings,
          previousTotalRevenue: prevTotalRevenue,
          previousTotalCustomers: prevTotalCustomers,
          previousTotalReviews: prevTotalReviews,
          bookingsGrowth,
          revenueGrowth,
          completedGrowth,
          cancelledGrowth,
          customersGrowth,
          reviewsGrowth,
        },
        openLink: reportLink,
      }),
      attachments: pdf?.filePath
        ? [
            {
              filename: pdf.fileName,
              path: pdf.filePath,
            },
          ]
        : [],
    });

    updatedReport = await monthlyReportModel.updateMonthlyReportEmailStatus({
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
    pdf,
  };
};

export const getMonthlyReports = async () => {
  return await monthlyReportModel.listMonthlyReports();
};
