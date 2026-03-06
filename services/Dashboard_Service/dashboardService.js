import * as dashboard from "../../models/Dashboard_Feature/dashboardModel.js";

export const getDashboardData = async () => {
  const totalBookings = await dashboard.getTotalBookings();
  const totalRevenue = await dashboard.getTotalRevenue();
  const pendingReviews = await dashboard.getPendingReviews();
  const activeServices = await dashboard.getActiveServices();
  const analytics = await dashboard.getBookingAnalytics();

  return {
    stats: {
      totalBookings,
      totalRevenue,
      pendingReviews,
      activeServices,
    },
    analytics,
  };
};
