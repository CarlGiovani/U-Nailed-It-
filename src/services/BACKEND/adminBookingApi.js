import api from "../axios";

/* ======================================
   ADMIN: Get All Bookings
====================================== */
export const getAllBookings = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  sortBy = "created_at",
  order = "desc",
} = {}) => {
  const res = await api.get("/bookings", {
    params: {
      page,
      limit,
      search,
      status,
      sortBy,
      order,
    },
  });

  return res.data;
};

/* ======================================
   ADMIN: Approve Booking
====================================== */
export const approveBooking = async (id) => {
  const res = await api.patch(`/bookings/${id}/approve`);
  return res.data;
};

/* ======================================
   ADMIN: Reject Booking
====================================== */
export const rejectBooking = async (id) => {
  const res = await api.patch(`/bookings/${id}/reject`);
  return res.data;
};

/* ======================================
   ADMIN: Complete Booking
====================================== */
export const completeBooking = async (id) => {
  const res = await api.patch(`/bookings/${id}/complete`);
  return res.data;
};

/* ======================================
   ADMIN: Update Booking Status (Generic)
====================================== */
export const updateBookingStatus = async (id, status) => {
  const res = await api.put(`/bookings/${id}/status`, { status });
  return res.data;
};
