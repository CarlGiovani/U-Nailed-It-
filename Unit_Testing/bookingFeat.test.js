import { beforeEach, describe, expect, it, vi } from "vitest";
import * as bookingController from "../controllers/Booking_Feature/bookingController.js";
import * as bookingModel from "../models/Booking_Feature/bookingModel.js";

vi.mock("../models/Booking_Feature/bookingModel.js", () => ({
  createBooking: vi.fn(),
  getAllBookings: vi.fn(),
  updateBookingStatus: vi.fn(),
}));

describe("Booking Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  // createBooking success
  it("createBooking - returns 201 and new booking", async () => {
    const fakeBooking = { id: "1", name: "Test" };
    req.body = { name: "Test" };
    bookingModel.createBooking.mockResolvedValue(fakeBooking);

    await bookingController.createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeBooking);
  });

  // createBooking failure
  it("createBooking - returns 400 on error", async () => {
    req.body = { name: "Test" };
    bookingModel.createBooking.mockRejectedValue(new Error("Invalid data"));

    await bookingController.createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid data" });
  });

  // getAllBookings - success
  it("getAllBookings - returns all bookings", async () => {
    const fakeBookings = [{ id: "1" }, { id: "2" }];
    bookingModel.getAllBookings.mockResolvedValue(fakeBookings);

    await bookingController.getAllBookings(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeBookings);
  });

  // getAllBookings failure
  it("getAllBookings - returns 500 on error", async () => {
    bookingModel.getAllBookings.mockRejectedValue(new Error("DB error"));

    await bookingController.getAllBookings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  // updateBookingStatus success
  it("updateBookingStatus - returns updated booking", async () => {
    const fakeUpdated = { id: "1", status: "approved" };
    req.body = { status: "approved" };
    req.params = { id: "1" };
    bookingModel.updateBookingStatus.mockResolvedValue(fakeUpdated);

    await bookingController.updateBookingStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeUpdated);
  });

  // updateBookingStatus failure
  it("updateBookingStatus - returns 400 on error", async () => {
    req.body = { status: "approved" };
    req.params = { id: "1" };
    bookingModel.updateBookingStatus.mockRejectedValue(
      new Error("Invalid status")
    );

    await bookingController.updateBookingStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid status" });
  });
});
