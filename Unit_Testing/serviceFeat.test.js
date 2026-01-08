import { describe, it, expect, vi, beforeEach } from "vitest";
import * as serviceController from "../controllers/Services_Feature/serviceController.js";
import * as serviceModel from "../models/Services_Feature/serviceModel.js";

vi.mock("../models/Services_Feature/serviceModel.js", () => ({
  getAllServices: vi.fn(),
  getServiceById: vi.fn(),
  createService: vi.fn(),
  updateService: vi.fn(),
  deleteService: vi.fn(),
}));

describe("Service Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  // getServices success
  it("getServices - returns all services", async () => {
    const fakeServices = [{ id: "1" }, { id: "2" }];
    serviceModel.getAllServices.mockResolvedValue(fakeServices);

    await serviceController.getServices(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeServices);
  });

  // getServices failure
  it("getServices - returns 500 on error", async () => {
    serviceModel.getAllServices.mockRejectedValue(new Error("DB error"));

    await serviceController.getServices(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  // getService  success
  it("getService - returns service by id", async () => {
    const fakeService = { id: "1", name: "Service 1" };
    req.params = { id: "1" };
    serviceModel.getServiceById.mockResolvedValue(fakeService);

    await serviceController.getService(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeService);
  });

  // getService  failure
  it("getService - returns 500 on error", async () => {
    req.params = { id: "1" };
    serviceModel.getServiceById.mockRejectedValue(new Error("DB error"));

    await serviceController.getService(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  // createService success
  it("createService - returns created service", async () => {
    const fakeService = { id: "1", name: "New Service" };
    req.body = { name: "New Service" };
    serviceModel.createService.mockResolvedValue(fakeService);

    await serviceController.createService(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Service created!",
      service: fakeService,
    });
  });

  // createService failure
  it("createService - returns 500 on error", async () => {
    req.body = { name: "New Service" };
    serviceModel.createService.mockRejectedValue(new Error("DB error"));

    await serviceController.createService(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  // updateService  success
  it("updateService - returns updated service", async () => {
    const fakeUpdated = { id: "1", name: "Updated Service" };
    req.params = { id: "1" };
    req.body = { name: "Updated Service" };
    serviceModel.updateService.mockResolvedValue(fakeUpdated);

    await serviceController.updateService(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Service updated!",
      service: fakeUpdated,
    });
  });

  // updateService failure
  it("updateService - returns 500 on error", async () => {
    req.params = { id: "1" };
    req.body = { name: "Updated Service" };
    serviceModel.updateService.mockRejectedValue(new Error("DB error"));

    await serviceController.updateService(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  // deleteService success
  it("deleteService - returns success message", async () => {
    req.params = { id: "1" };
    const fakeDeleted = { id: "1", name: "Service" };
    serviceModel.deleteService.mockResolvedValue(fakeDeleted);

    await serviceController.deleteService(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Service deactivated!",
      service: fakeDeleted,
    });
  });

  // deleteService - failure
  it("deleteService - returns 500 on error", async () => {
    req.params = { id: "1" };
    serviceModel.deleteService.mockRejectedValue(new Error("DB error"));

    await serviceController.deleteService(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });
});
