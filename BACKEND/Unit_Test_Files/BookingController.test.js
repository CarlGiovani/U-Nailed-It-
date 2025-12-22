import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAvailableSlot } from "../controllers/bookingController.js";

import * as AvailabilityModel from "../models/availabilityModel.js";
import * as BookingModel from "../models/bookingModel.js";
import * as ServiceModel from "../models/serviceModel.js";


vi.mock("../models/serviceModel.js", () => ({
  getAll: vi.fn(),
}));

vi.mock("../models/availabilityModel.js", () => ({
  getSettings: vi.fn(),
}));

vi.mock("../models/bookingModel.js", () => ({
  getBookingsBydate: vi.fn(),
}));

describe("getAvailableSlot Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
  });

  // ===============================
  // VALIDATION
  // ===============================
  it("should return 400 if service_id or date is missing", async () => {
    req.query = { service_id: "1" };

    await getAvailableSlot(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "missing service id or date",
    });
  });

  it("should return 400 if service not found", async () => {
    req.query = { service_id: "1", date: "2025-01-01" };

    ServiceModel.getAll.mockResolvedValue([{ id: 2, duration_minutes: 30 }]);

    await getAvailableSlot(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Service not found",
    });
  });

  // ===============================
  // SUCCESS
  // ===============================
  it("should return available slots", async () => {
    req.query = { service_id: "1", date: "2025-01-01" };

    ServiceModel.getAll.mockResolvedValue([{ id: 1, duration_minutes: 30 }]);

    AvailabilityModel.getSettings.mockResolvedValue({
      start_time: "09:00",
      end_time: "12:00",
      buffer_minutes: 0,
      slot_interval_minutes: 30,
    });

    BookingModel.getBookingsBydate.mockResolvedValue([
      { appointment_time: "2025-01-01T09:30:00" },
    ]);

    await getAvailableSlot(req, res);

    expect(res.json).toHaveBeenCalledWith([
      "09:00",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
    ]);
  });

  // ===============================
  // ERROR HANDLING
  // ===============================
  it("should return 500 on server error", async () => {
    req.query = { service_id: "1", date: "2025-01-01" };

    ServiceModel.getAll.mockRejectedValue(new Error("Database error"));

    await getAvailableSlot(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Database error",
    });
  });
});
