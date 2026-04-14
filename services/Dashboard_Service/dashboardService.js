import * as dashboard from "../../models/Dashboard_Feature/dashboardModel.js";
import { customerBlockedTemplate } from "../../templates/emails/customerBlockedTemplate.js";
import sendEmail from "../Email_Feature/emailService.js";
export const getDashboardData = async () => {
  const totalBookings = await dashboard.getTotalBookings();
  const totalRevenue = await dashboard.getTotalRevenue();
  const pendingReviews = await dashboard.getPendingReviews();
  const activeServices = await dashboard.getActiveServices();
  const analytics = await dashboard.getBookingAnalytics();
  const recentBookings = await dashboard.getRecentBookings();
  const bookingStatusCounts = await dashboard.getBookingStatusCounts();

  return {
    stats: {
      totalBookings,
      totalRevenue,
      pendingReviews,
      activeServices,
      pendingApprovalBookings: bookingStatusCounts.pending_approval || 0,
    },
    analytics,
    recentBookings,
  };
};

export const getSystemExportData = async () => {
  return await dashboard.getSystemExportData();
};

export const blockCustomer = async ({
  email,
  name,
  reason,
  cancelCount,
  adminId,
}) => {
  const blockedCustomer = await dashboard.blockCustomerByEmail({
    email,
    reason,
    adminId,
  });

  try {
    await sendEmail({
      to: email,
      subject: "Your Account Has Been Restricted",
      html: customerBlockedTemplate({
        name: name || blockedCustomer?.full_name || "Customer",
        email,
        reason: reason || "Too many cancellations",
        cancelCount: cancelCount || 0,
      }),
    });
  } catch (emailError) {
    console.error("Failed to send blocked customer email:", emailError.message);
  }

  return blockedCustomer;
};

export const unblockCustomer = async ({ customer_id }) => {
  return await dashboard.unblockCustomerById({
    customer_id,
  });
};