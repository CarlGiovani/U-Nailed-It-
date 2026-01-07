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




