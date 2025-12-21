import { addMinutes, format, parseISO } from "date-fns";
import * as AvailabilityModel from "../models/availabilityModel.js";
import * as BookingModel from "../models/bookingModel.js";
import * as ServiceModel from "../models/ServiceModel.js";

export async function getAvailableSlot(req, res) {
  try {
    const { service_id, date } = req.query;
    if (!service_id || !date) {
      return res.status(400).json({ message: "missing service id or date" });
    }

    const services = await ServiceModel.getAll();

    const selectedService = services.find(
      (s) => String(s.id) === String(service_id)
    );

    if (!selectedService) {
      return res.status(400).json({ message: "Service not found" });
    }

    const { duration_minutes } = selectedService;

    const settings = await AvailabilityModel.getSettings();
    const appointments = await BookingModel.getBookingsBydate(date);

    const start = parseISO(`${date}T${settings.start_time}`);
    const end = parseISO(`${date}T${settings.end_time}`);

    const slots = [];
    let current = start;

    while (current < end) {
      const next = addMinutes(
        current,
        duration_minutes + settings.buffer_minutes
      );

      const overlap = appointments.some((a) => {
        const booked = parseISO(a.appointment_time);
        return (
          current < addMinutes(booked, duration_minutes) &&
          addMinutes(current, duration_minutes) > booked
        );
      });

      if (!overlap && next <= end) {
        slots.push(format(current, "HH:mm"));
      }

      current = addMinutes(current, settings.slot_interval_minutes);
    }

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
