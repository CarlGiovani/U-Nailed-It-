import * as booking from "../../models/Booking_Feature/bookingModel.js";

//PUBLIC : create booking
export const createBooking = async (req, res) => {
  try {
    const newBooking = await booking.createBooking(req.body);
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ADMIN : get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await booking.getAllBookings();
    res.json(bookings);
    console.log(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: update booking status (approve / reject / completed)
export const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await booking.updateBookingStatus(req.params.id, status);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// ADMIN: approve booking
export const approveBooking = async (req, res) => {
  try {
    const result = await booking.approveBooking(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ADMIN: reject booking
export const rejectBooking = async (req, res) => {
  try {
    const result = await booking.rejectBooking(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUBLIC: cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const result = await booking.cancelBooking(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};