import { beforeEach, describe, expect, it, vi } from "vitest";
import * as bookingController from "../controllers/Booking_Feature/bookingController.js";
import * as bookingModel from "../models/Booking_Feature/bookingModel.js";
import sendEmail from "../services/Email_Feature/emailService.js";
import { unblockSlotGlobally } from "../models/Calendar_Feature/calendarModel.js";

// MOCKS
vi.mock("../models/Booking_Feature/bookingModel.js", () => ({
  createBookingWithCustomer: vi.fn(),
  getAllBookings: vi.fn(),
  updateBookingStatus: vi.fn(),
  approveBooking: vi.fn(),
  rejectBooking: vi.fn(),
  cancelBooking: vi.fn(),
}));

vi.mock("../services/Email_Feature/emailService.js", () => ({
  default: vi.fn(),
}));

vi.mock("../models/Calendar_Feature/calendarModel.js", () => ({
  unblockSlotGlobally: vi.fn(),
}));

//TEST SUITES
describe("Booking Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.clearAllMocks();
  });

  // =======================
  // CREATE BOOKING (PUBLIC)
  // =======================

  it("createBooking - returns 201 and new booking", async () => {
    const fakeBooking = {
      id: "1",
      customers: {
        email: "test@gmail.com",
        full_name: "Test User",
      },
      services: {
        name: "Haircut",
      },
    };

    req.body = {
      service_id: "1",
      booking_date: "2025-01-20",
      booking_time: "10:00",
    };

    bookingModel.createBookingWithCustomer.mockResolvedValue(fakeBooking);

    await bookingController.createBooking(req, res);

    expect(bookingModel.createBookingWithCustomer).toHaveBeenCalledWith(req.body);
    expect(sendEmail).toHaveBeenCalled(); // email sent
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeBooking);
  });

  it("createBooking - returns 400 on error", async () => {
    bookingModel.createBookingWithCustomer.mockRejectedValue(
      new Error("Invalid data")
    );

    await bookingController.createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid data" });
  });

  // =======================
  // GET ALL BOOKINGS (ADMIN)
  // =======================

  it("getAllBookings - returns all bookings", async () => {
    const fakeBookings = [{ id: "1" }, { id: "2" }];

    bookingModel.getAllBookings.mockResolvedValue(fakeBookings);

    await bookingController.getAllBookings(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeBookings);
  });

  it("getAllBookings - returns 500 on error", async () => {
    bookingModel.getAllBookings.mockRejectedValue(
      new Error("DB error")
    );

    await bookingController.getAllBookings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  // =======================
  // UPDATE BOOKING STATUS
  // =======================

  it("updateBookingStatus - returns updated booking", async () => {
    const fakeUpdated = { id: "1", status: "approved" };

    req.params = { id: "1" };
    req.body = { status: "approved" };

    bookingModel.updateBookingStatus.mockResolvedValue(fakeUpdated);

    await bookingController.updateBookingStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeUpdated);
  });

  it("updateBookingStatus - returns 400 on error", async () => {
    req.params = { id: "1" };
    req.body = { status: "approved" };

    bookingModel.updateBookingStatus.mockRejectedValue(
      new Error("Invalid status")
    );

    await bookingController.updateBookingStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid status" });
  });

  // =======================
  // APPROVE BOOKING (ADMIN)
  // =======================

  it("approveBooking - approves booking and sends email", async () => {
    const fakeApproved = {
      id: "1",
      customers: {
        email: "user@gmail.com",
        full_name: "User Test",
      },
      services: {
        name: "Massage",
      },
    };

    req.params = { id: "1" };

    bookingModel.approveBooking.mockResolvedValue(fakeApproved);

    await bookingController.approveBooking(req, res);

    expect(sendEmail).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(fakeApproved);
  });

  it("approveBooking - returns 400 on error", async () => {
    bookingModel.approveBooking.mockRejectedValue(
      new Error("Approval failed")
    );

    await bookingController.approveBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Approval failed" });
  });

  // =======================
  // REJECT BOOKING (ADMIN)
  // =======================

  it("rejectBooking - rejects booking, sends email and unblocks slot", async () => {
    const fakeRejected = {
      id: "1",
      booking_date: "2025-01-20",
      booking_time: "10:00",
      customers: {
        email: "user@gmail.com",
        full_name: "User Test",
      },
      services: {
        name: "Massage",
      },
    };

    req.params = { id: "1" };

    bookingModel.rejectBooking.mockResolvedValue(fakeRejected);

    await bookingController.rejectBooking(req, res);

    expect(sendEmail).toHaveBeenCalled();
    expect(unblockSlotGlobally).toHaveBeenCalledWith(
      fakeRejected.booking_date,
      fakeRejected.booking_time
    );
    expect(res.json).toHaveBeenCalledWith(fakeRejected);
  });

  it("rejectBooking - returns 400 on error", async () => {
    bookingModel.rejectBooking.mockRejectedValue(
      new Error("Reject failed")
    );

    await bookingController.rejectBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Reject failed" });
  });

  // =======================
  // CANCEL BOOKING (PUBLIC)
  // =======================

  it("cancelBooking - cancels booking", async () => {
    const fakeCancelled = {
      id: "1",
      service_id: "1",
      booking_date: "2025-01-20",
      booking_time: "10:00",
    };

    req.params = { id: "1" };

    bookingModel.cancelBooking.mockResolvedValue(fakeCancelled);

    await bookingController.cancelBooking(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeCancelled);
  });

  it("cancelBooking - returns 400 on error", async () => {
    bookingModel.cancelBooking.mockRejectedValue(
      new Error("Cancel failed")
    );

    await bookingController.cancelBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Cancel failed" });
  });
});
