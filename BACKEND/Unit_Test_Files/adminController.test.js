import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginAdmin, seedAdmin } from "../controllers/adminController.js";
import * as AdminModel from "../models/adminModel.js";

// MOCK dependencies
vi.mock("bcryptjs");
vi.mock("jsonwebtoken");
vi.mock("../models/adminModel.js");

describe("Admin Controller Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.clearAllMocks();
  });

  // ======================
  // seedAdmin tests
  // ======================
  describe("seedAdmin", () => {
    it("should return admin already exists", async () => {
      bcrypt.hash.mockResolvedValue("hashed-password");
      AdminModel.findByUsername.mockResolvedValue({ id: 1 });

      await seedAdmin(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Admin already exists",
        username: "owner",
      });
    });

    it("should create admin if not exists", async () => {
      bcrypt.hash.mockResolvedValue("hashed-password");
      AdminModel.findByUsername.mockResolvedValue(null);
      AdminModel.createAdmin.mockResolvedValue(true);

      await seedAdmin(req, res);

      expect(AdminModel.createAdmin).toHaveBeenCalledWith({
        username: "owner",
        password_hash: "hashed-password",
        role: "superadmin",
      });

      expect(res.json).toHaveBeenCalledWith({
        message: "Admin created",
        username: "owner",
        password: "123456",
      });
    });

    it("should handle server error", async () => {
      bcrypt.hash.mockRejectedValue(new Error("Hash error"));

      await seedAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Hash error",
      });
    });
  });

  // ======================
  // loginAdmin tests
  // ======================
  describe("loginAdmin", () => {
    it("should return 400 if credentials missing", async () => {
      req.body = {};

      await loginAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Missing credentials",
      });
    });

    it("should return 401 if user not found", async () => {
      req.body = { username: "owner", password: "123456" };
      AdminModel.findByUsername.mockResolvedValue(null);

      await loginAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("should return 401 if password invalid", async () => {
      req.body = { username: "owner", password: "wrongpass" };
      AdminModel.findByUsername.mockResolvedValue({
        id: 1,
        username: "owner",
        password_hash: "hashed",
        role: "superadmin",
      });

      bcrypt.compare.mockResolvedValue(false);

      await loginAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
      });
    });

    it("should login successfully and return token", async () => {
      req.body = { username: "owner", password: "123456" };

      const fakeAdmin = {
        id: 1,
        username: "owner",
        password_hash: "hashed",
        role: "superadmin",
      };

      AdminModel.findByUsername.mockResolvedValue(fakeAdmin);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("fake-jwt-token");

      await loginAdmin(req, res);

      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "✅ Login successful",
        token: "fake-jwt-token",
        admin: {
          id: 1,
          username: "owner",
          role: "superadmin",
        },
      });
    });

    it("should handle server error", async () => {
      req.body = { username: "owner", password: "123456" };
      AdminModel.findByUsername.mockRejectedValue(new Error("DB error"));

      await loginAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });
  });
});
