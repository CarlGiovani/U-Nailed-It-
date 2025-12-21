import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAvailableSlot } from "../controllers/bookingController.js";

import * as ServiceModel from "../models/ServiceModel.js";
import * as AvailabilityModel from "../models/availabilityModel.js";
import * as BookingModel from "../models/bookingModel.js";

// MOCKS
vi.mock("../models/ServiceModel.js");
vi.mock("../models/availabilityModel.js");

// FIX: explicit mock implementation
vi.mock("../models/bookingModel.js", () => ({
  getBookingsBydate: vi.fn().mockResolvedValue([]),
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
