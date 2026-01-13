import * as booking from "../../models/Booking_Feature/bookingModel.js";
import { unblockSlot } from "../../models/Calendar_Feature/calendarModel.js";
import sendEmail from "../../services/Email_Feature/emailService.js";
import { bookingApprovedTemplate } from "../../templates/emails/bookingApproved.js";
import { bookingSubmittedTemplate } from "../../templates/emails/bookingSubmitted.js";

//PUBLIC : create booking
export const createBooking = async (req, res) => {
  try {
    const newBooking = await booking.createBooking(req.body);
    await sendEmail({
      to: req.body.email,
      subject: "BOOKING SUBMITTED",

      html: bookingSubmittedTemplate({
        name: req.body.full_name,
        service: "Selected Service",
      }),
    });
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

    const cancelLink = `http://localhost:5000/api/bookings/${result.id}/cancel`;

    await sendEmail({
      to: result.customers.email,
      subject: "Booking Approved",
      html: bookingApprovedTemplate({
        name: result.customers.full_name,
        service: result.services.name,
        cancelLink,
      }),
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ADMIN: reject booking
export const rejectBooking = async (req, res) => {
  try {
    const result = await booking.rejectBooking(req.params.id);

    await unblockSlot(
      result.service_id,
      result.booking_date,
      result.booking_time
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUBLIC: cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const result = await booking.cancelBooking(req.params.id);

    await unblockSlot(
      result.service_id,
      result.booking_date,
      result.booking_time
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
