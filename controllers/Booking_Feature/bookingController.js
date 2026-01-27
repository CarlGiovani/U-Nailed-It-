import * as booking from "../../models/Booking_Feature/bookingModel.js";

import sendEmail from "../../services/Email_Feature/emailService.js";
import { bookingApprovedTemplate } from "../../templates/emails/bookingApproved.js";
import { bookingRejectedTemplate } from "../../templates/emails/bookingRejected.js";
import { bookingSubmittedTemplate } from "../../templates/emails/bookingSubmitted.js";

import {
  createBookingSchema,
  updateBookingStatusSchema,
  validate,
} from "../../utils/validators/bookingValidation.js";

//PUBLIC : create booking (updated to create customer if not exists all in one sya)
// PUBLIC : create booking (Step 1)
export const createBooking = async (req, res) => {
  const errors = validate(createBookingSchema, req.body);
  if (errors) return res.status(400).json({ errors });

  try {
    // Step 1: Pending payment booking
    const newBooking = await booking.createBookingWithCustomer(req.body);

    // Email: booking submitted
    if (newBooking.customers?.email) {
      await sendEmail({
        to: newBooking.customers.email,
        subject: "BOOKING SUBMITTED",
        html: bookingSubmittedTemplate({
          name: newBooking.customers.full_name,
          service: newBooking.services?.name || "Selected Service",
        }),
      });
    }

    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUBLIC: confirm booking (Step 3)
export const confirmBooking = async (req, res) => {
  const { payment_intent_id } = req.body;
  if (!payment_intent_id)
    return res.status(400).json({ error: "payment_intent_id required" });

  try {
    // Step 3: Check slot, lock, create final booking
    const bookingData = await booking.createBookingWithPaymentIntent(payment_intent_id);

    // Email: booking confirmed
    if (bookingData.customers?.email) {
      await sendEmail({
        to: bookingData.customers.email,
        subject: "Booking Confirmed",
        html: bookingSubmittedTemplate({
          name: bookingData.customers.full_name,
          service: bookingData.services?.name || "Selected Service",
        }),
      });
    }

    res.status(201).json({ message: "Booking confirmed", booking: bookingData });
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
  // ---- VALIDATION ----
  const errors = validate(updateBookingStatusSchema, req.body);
  if (errors) return res.status(400).json({ errors });

  try {
    const updated = await booking.updateBookingStatus(
      req.params.id,
      req.body.status,
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ADMIN: approve booking
// GUMAGANA NA TO
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
// GUMAGANA NA TO
export const rejectBooking = async (req, res) => {
  try {
    const result = await booking.rejectBooking(req.params.id);

    await sendEmail({
      to: result.customers.email,
      subject: "Booking Rejected",
      html: bookingRejectedTemplate({
        name: result.customers.full_name,
        service: result.services.name,
      }),
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUBLIC: cancel booking
// TODO: send email notification upon cancellation IMPLEMENTATION
export const cancelBooking = async (req, res) => {
  try {
    const result = await booking.cancelBooking(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
