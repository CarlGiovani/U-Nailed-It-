import { describe, it, expect, vi, beforeEach } from "vitest";
import * as calendarController from "../controllers/Calendar_Feature/calendarController.js";
import * as calendarModel from "../models/Calendar_Feature/calendarModel.js";

vi.mock("../models/Calendar_Feature/calendarModel.js", () => ({
  createSlot: vi.fn(),
  getAvailableSlots: vi.fn(),
  updateSlot: vi.fn(),
  deleteSlot: vi.fn(),
}));

describe("Calendar Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  // createSlot - success
  it("createSlot - returns 201 and created slot", async () => {
    const fakeSlot = { id: "1", time: "10:00 AM" };
    req.body = { time: "10:00 AM" };
    calendarModel.createSlot.mockResolvedValue(fakeSlot);

    await calendarController.createSlot(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeSlot);
  });

  // createSlot failure
  it("createSlot - returns 500 on error", async () => {
    req.body = { time: "10:00 AM" };
    calendarModel.createSlot.mockRejectedValue(new Error("DB error"));

    await calendarController.createSlot(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  // getAvailableSlots success
  it("getAvailableSlots - returns slots", async () => {
    const fakeSlots = [{ id: "1", time: "10:00 AM" }];
    req.query = { service_id: "s1", date: "2026-01-10" };
    calendarModel.getAvailableSlots.mockResolvedValue(fakeSlots);

    await calendarController.getAvailableSlots(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeSlots);
  });

  // getAvailableSlots failure
  it("getAvailableSlots - returns 500 on error", async () => {
    req.query = { service_id: "s1", date: "2026-01-10" };
    calendarModel.getAvailableSlots.mockRejectedValue(new Error("DB error"));

    await calendarController.getAvailableSlots(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  // updateSlot success
  it("updateSlot - returns updated slot", async () => {
    const fakeUpdated = { id: "1", time: "11:00 AM" };
    req.body = { time: "11:00 AM" };
    req.params = { id: "1" };
    calendarModel.updateSlot.mockResolvedValue(fakeUpdated);

    await calendarController.updateSlot(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeUpdated);
  });

  // updateSlot failure
  it("updateSlot - returns 500 on error", async () => {
    req.body = { time: "11:00 AM" };
    req.params = { id: "1" };
    calendarModel.updateSlot.mockRejectedValue(new Error("DB error"));

    await calendarController.updateSlot(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  // deleteSlot success
  it("deleteSlot - returns success message", async () => {
    req.params = { id: "1" };
    calendarModel.deleteSlot.mockResolvedValue();

    await calendarController.deleteSlot(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "SLOT DELETED!" });
  });

  // deleteSlot failure
  it("deleteSlot - returns 500 on error", async () => {
    req.params = { id: "1" };
    calendarModel.deleteSlot.mockRejectedValue(new Error("DB error"));

    await calendarController.deleteSlot(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });
});
