import dotenv from "dotenv";
import * as booking from "../../models/Booking_Feature/bookingModel.js";
import { logAction } from "../../services/Audit_Service/auditService.js";
import sendEmail from "../../services/Email_Feature/emailService.js";
import { bookingApprovedTemplate } from "../../templates/emails/bookingApproved.js";
import { bookingCompletedTemplate } from "../../templates/emails/bookingCompletedTemplate.js";
import { bookingRejectedTemplate } from "../../templates/emails/bookingRejected.js";
import { bookingSubmittedTemplate } from "../../templates/emails/bookingSubmitted.js";

dotenv.config();

import {
  createBookingSchema,
  updateBookingStatusSchema,
  validate,
} from "../../utils/validators/bookingValidation.js";

import { createAdminNotifAndSendGmail } from "../../services/Admin_Gmail_Notif_Feature/adminGmailNotIFService.js";

/* ==========================================
   PUBLIC: Step 1 - Create booking (pending_payment)
========================================== */
export const createBooking = async (req, res) => {
  const errors = validate(createBookingSchema, req.body);
  if (errors) return res.status(400).json({ errors });

  try {
    const newBooking = await booking.createBookingWithCustomer(req.body);

    // ADMIN NOTIF + GMAIL
    await createAdminNotifAndSendGmail({
      type: "booking",
      title: "New Booking",
      message: `${newBooking.customer_name || "A customer"} created a new booking.`,
      link: `/bookings?bookingId=${newBooking.id}`,
      related_entity: "bookings",
      related_id: newBooking.id,
    });

    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ==========================================
   PUBLIC: Review page - Get booking details
   GET /bookings/:id
========================================== */
export const getBookingById = async (req, res) => {
  try {
    const bookingData = await booking.getBookingById(req.params.id);
    res.json(bookingData);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/* ==========================================
   PUBLIC: Step 3 - Confirm booking (manual button)
   POST /bookings/:id/confirm
   body: { payment_intent_id }
========================================== */
export const confirmBooking = async (req, res) => {
  const bookingId = req.params.id;
  const { payment_intent_id } = req.body;

  if (!payment_intent_id) {
    return res.status(400).json({ error: "payment_intent_id required" });
  }

  try {
    // IMPORTANT:
    // Dapat sa model: i-check na intent.booking_id === bookingId
    // Suggest: gumawa ng function confirmBookingForBookingId(bookingId, intentId)
    const updatedBooking = await booking.confirmBookingForBookingId(
      bookingId,
      payment_intent_id,
    );

    // Email: booking moved to pending_approval (confirmed by user)
    // NOTE: Make sure updatedBooking includes customers/services
    if (updatedBooking.customers?.email) {
      await sendEmail({
        to: updatedBooking.customers.email,
        subject: "Booking Confirmed",
        html: bookingSubmittedTemplate({
          name: updatedBooking.customers.full_name,
          service: updatedBooking.services?.name || "Selected Service",
        }),
      });
    }

    await createAdminNotifAndSendGmail({
      type: "booking",
      title: "Booking Submitted",
      message: `${updatedBooking.customers.full_name} confirmed their booking.`,
      link: `/bookings?bookingId=${updatedBooking.id}`,
      related_entity: "bookings",
      related_id: updatedBooking.id,
    });

    res.status(200).json({
      message: "Booking confirmed (pending approval)",
      booking: updatedBooking,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ==========================================
   ADMIN: Get all bookings
========================================== */
export const getAllBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      dateFrom = "",
      dateTo = "",
      sortBy = "created_at",
      order = "desc",
    } = req.query;

    const result = await booking.getAllBookings({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
      dateFrom,
      dateTo,
      sortBy,
      order,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ==========================================
   ADMIN: update booking status (generic)
========================================== */
export const updateBookingStatus = async (req, res) => {
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

/* ==========================================
   ADMIN: approve booking
========================================== */
export const approveBooking = async (req, res) => {
  try {
    const result = await booking.approveBooking(req.params.id);

    // Lagay ko sa env aferd ko ma-deploy tas tago sa env
    const FRONTEND_CANCEL_URL =
      process.env.FRONTEND_CANCEL_URL || "http://localhost:5173/cancel";

    const cancelLink = `${FRONTEND_CANCEL_URL}?token=${result.cancel_token}`;

    await sendEmail({
      to: result.customers.email,
      subject: "Booking Approved",
      html: bookingApprovedTemplate({
        name: result.customers.full_name,
        service: result.services.name,
        date: result.booking_date,
        time: result.booking_time,
        cancelLink,
      }),
    });

    // AUDIT LOG
    await logAction({
      admin_id: req.user?.id || null,
      action: "approve_booking",
      entity: "bookings",
      entity_id: result.id,
      description: `Approved booking #${result.id}`,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ==========================================
   ADMIN: reject booking
========================================== */
export const rejectBooking = async (req, res) => {
  try {
    const result = await booking.rejectBooking(req.params.id);

    await sendEmail({
      to: result.customers.email,
      subject: "Booking Rejected",
      html: bookingRejectedTemplate({
        name: result.customers.full_name,
        service: result.services.name,
        date: result.booking_date,
        time: result.booking_time,
      }),
    });

    // AUDIT LOG
    await logAction({
      admin_id: req.user?.id || null,
      action: "reject_booking",
      entity: "bookings",
      entity_id: result.id,
      description: `Rejected booking #${result.id}`,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ==========================================
   PUBLIC: cancel booking
   TODO: Sa cancellation dapat mag notif sa admin (pwede email or dashboard notification) para malaman nila na may nag cancel ng booking.
========================================== */
export const cancelBooking = async (req, res) => {
  try {
    const { token } = req.query;
    const { reason } = req.body;
    if (!token)
      return res.status(400).json({ error: "Cancellation token is required" });
    const result = await booking.cancelBookingByToken(token, reason);

    //ADMIN NOTIFICATION + EMAIL
    await createAdminNotifAndSendGmail({
      type: "booking",
      title: "Booking Cancelled",
      message: `${result.customer_name || "A customer"} cancelled their booking.`,
      link: `/bookings?bookingId=${result.id}&status=cancelled`,
      related_entity: "bookings",
      related_id: result.id,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ==========================================
   ADMIN: complete booking
   PATCH /bookings/:id/complete
========================================== */

export const completeBooking = async (req, res) => {
  try {
    const result = await booking.completeBooking(req.params.id);

    const FRONTEND_REVIEW_URL =
      process.env.FRONTEND_REVIEW_URL || "http://localhost:5173";

    const reviewLink = `${FRONTEND_REVIEW_URL}/review?token=${result.review_token}`;

    await sendEmail({
      to: result.customers.email,
      subject: "How was your appointment?",
      html: bookingCompletedTemplate({
        name: result.customers.full_name,
        service: result.services?.name || "Your Service",
        date: result.booking_date,
        time: result.booking_time,
        reviewLink,
      }),
    });

    // AUDIT LOG
    await logAction({
      admin_id: req.user?.id || null,
      action: "complete_booking",
      entity: "bookings",
      entity_id: result.id,
      description: `Completed booking #${result.id}`,
    });

    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
