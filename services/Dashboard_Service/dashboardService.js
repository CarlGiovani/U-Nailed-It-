import * as dashboard from "../../models/Dashboard_Feature/dashboardModel.js";

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
}
