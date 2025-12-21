import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAvailableSlot } from "../controllers/bookingController.js";

import * as ServiceModel from "../models/ServiceModel.js";
import * as AvailabilityModel from "../models/availabilityModel.js";
import * as BookingModel from "../models/bookingModel.js";

// ✅ EXPLICIT MOCKS
vi.mock("../models/ServiceModel.js", () => ({
  getAll: vi.fn(),
}));

vi.mock("../models/bookingModel.js", () => ({
  getBookingsBydate: vi.fn(),
}));

vi.mock("../models/availabilityModel.js", () => ({
  getSettings: vi.fn(),
}));

describe("getAvailableSlot Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {
        service_id: "1",
        date: "2025-01-01",
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.clearAllMocks();
  });

  it("should return available slots", async () => {
    ServiceModel.getAll.mockResolvedValue([{ id: 1, duration_minutes: 30 }]);

    AvailabilityModel.getSettings.mockResolvedValue({
      start_time: "09:00",
      end_time: "10:00",
      buffer_minutes: 0,
      slot_interval_minutes: 30,
    });

    BookingModel.getBookingsBydate.mockResolvedValue([]);

    await getAvailableSlot(req, res);

    expect(res.json).toHaveBeenCalledWith(["09:00", "09:30"]);
  });

  it("should return 500 on server error", async () => {
    ServiceModel.getAll.mockRejectedValue(new Error("Database error"));

    await getAvailableSlot(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Database error",
    });
  });
});
