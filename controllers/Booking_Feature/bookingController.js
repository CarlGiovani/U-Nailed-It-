import * as booking from "../../models/Booking_Feature/bookingModel.js";

import sendEmail from "../../services/Email_Feature/emailService.js";
import { bookingApprovedTemplate } from "../../templates/emails/bookingApproved.js";
import { bookingSubmittedTemplate } from "../../templates/emails/bookingSubmitted.js";
import { bookingRejectedTemplate } from "../../templates/emails/bookingRejected.js";
import { unblockSlotGlobally } from "../../models/Calendar_Feature/calendarModel.js";



//PUBLIC : create booking (updated to create customer if not exists all in one sya)
export const createBooking = async (req, res) => {
  try {
    const newBooking = await booking.createBookingWithCustomer(req.body);
    if(newBooking.customers && newBooking.customers.email){
      await sendEmail({
      to: newBooking.customers.email,
      subject: "BOOKING SUBMITTED",

      html: bookingSubmittedTemplate({
        name: newBooking.customers.full_name,
         service: newBooking.services ? newBooking.services.name : "Selected Service",
      }),
    });
    }
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

   await unblockSlotGlobally(result.booking_date, result.booking_time);

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUBLIC: cancel booking
// TODO: send email notification upon cancellation IMPLAMENTATION
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
