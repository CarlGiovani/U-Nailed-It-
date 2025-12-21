import { describe, it, expect, vi, beforeEach } from "vitest";

// controller
import {
  getActiveServices,
  getAllServices,
  upsertService,
  deleteService,
} from "../controllers/serviceController.js";

// model (LOWERCASE – MATCH FILE)
import * as ServiceModel from "../models/serviceModel.js";

// mock serviceModel
vi.mock("../models/serviceModel.js");

// mock supabase
vi.mock("../config/db.js", () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: "http://test-image.com/img.png" },
        }),
      }),
    },
  },
}));

describe("Service Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      files: null,
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.clearAllMocks();
  });

  // ===============================
  // GET ACTIVE SERVICES
  // ===============================
  it("should return active services", async () => {
    ServiceModel.getAllActive.mockResolvedValue([
      { id: 1, name: "Manicure" },
    ]);

    await getActiveServices(req, res);

    expect(res.json).toHaveBeenCalledWith([
      { id: 1, name: "Manicure" },
    ]);
  });

  it("should return 500 if getActiveServices fails", async () => {
    ServiceModel.getAllActive.mockRejectedValue(new Error("DB error"));

    await getActiveServices(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ===============================
  // GET ALL SERVICES
  // ===============================
  it("should return all services", async () => {
    ServiceModel.getAll.mockResolvedValue([{ id: 1 }]);

    await getAllServices(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  // ===============================
  // UPSERT SERVICE
  // ===============================
  it("should return 400 if required fields missing", async () => {
    req.body = { name: "Test" };

    await upsertService(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should save service successfully", async () => {
    req.body = {
      name: "Test",
      price: 100,
      duration_minutes: 30,
    };

    ServiceModel.upsert.mockResolvedValue();

    await upsertService(req, res);

    expect(ServiceModel.upsert).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Service saved successfully",
    });
  });

  // ===============================
  // DELETE SERVICE
  // ===============================
  it("should return 400 if id missing", async () => {
    await deleteService(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should delete service", async () => {
    req.params.id = "1";
    ServiceModel.remove.mockResolvedValue();

    await deleteService(req, res);

    expect(ServiceModel.remove).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith({
      message: "Service deleted",
    });
  });
});
