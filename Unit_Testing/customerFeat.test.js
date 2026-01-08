import { describe, it, expect, vi, beforeEach } from "vitest";
import * as customerController from "../controllers/Customer_Feature/customerController.js";
import * as customerModel from "../models/Customer_Feature/customerModel.js";


vi.mock("../models/Customer_Feature/customerModel.js", () => ({
  getOrCreateCustomer: vi.fn(),
  getCustomerByEmail: vi.fn(),
  getAllCustomers: vi.fn(),
}));

describe("Customer Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  // createOrGetCustomer success
  it("createOrGetCustomer - returns 201 and customer", async () => {
    const fakeCustomer = { id: "1", email: "test@test.com" };
    req.body = { email: "test@test.com" };
    customerModel.getOrCreateCustomer.mockResolvedValue(fakeCustomer);

    await customerController.createOrGetCustomer(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeCustomer);
  });

  // createOrGetCustomer failure
  it("createOrGetCustomer - returns 500 on error", async () => {
    req.body = { email: "test@test.com" };
    customerModel.getOrCreateCustomer.mockRejectedValue(new Error("DB error"));

    await customerController.createOrGetCustomer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  // getCustomerByEmail success
  it("getCustomerByEmail - returns customer", async () => {
    const fakeCustomer = { id: "1", email: "test@test.com" };
    req.query = { email: "test@test.com" };
    customerModel.getCustomerByEmail.mockResolvedValue(fakeCustomer);

    await customerController.getCustomerByEmail(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeCustomer);
  });

  // getCustomerByEmail failure
  it("getCustomerByEmail - returns 500 on error", async () => {
    req.query = { email: "test@test.com" };
    customerModel.getCustomerByEmail.mockRejectedValue(new Error("DB error"));

    await customerController.getCustomerByEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  // getAllCustomers success
  it("getAllCustomers - returns all customers", async () => {
    const fakeCustomers = [{ id: "1" }, { id: "2" }];
    customerModel.getAllCustomers.mockResolvedValue(fakeCustomers);

    await customerController.getAllCustomers(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeCustomers);
  });

  // getAllCustomers failure
  it("getAllCustomers - returns 500 on error", async () => {
    customerModel.getAllCustomers.mockRejectedValue(new Error("DB error"));

    await customerController.getAllCustomers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });
});
