import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminLogin } from "../controllers/Authentication_Feature/authController.js";
import supabase from "../utils/supabaseClient.js";

//Mock supabase client
vi.mock("../utils/supabaseClient.js", () => ({
  default: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));


describe("adminLogin controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  // Missing email or password → 400
  it("returns 400 if email or password is missing", async () => {
    req.body = { email: "", password: "" };

    await adminLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Email and password required",
    });
  });

  // Supabase returns error  401
  it("returns 401 if supabase returns error", async () => {
    req.body = { email: "admin@test.com", password: "wrongpass" };

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });

    await adminLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid login credentials",
    });
  });

  // Success 200
  it("returns user and session on successful login", async () => {
    req.body = { email: "admin@test.com", password: "correctpass" };

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: "token123" },
        user: { id: "user123", email: "admin@test.com" },
      },
      error: null,
    });

    await adminLogin(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      session: { access_token: "token123" },
      user: { id: "user123", email: "admin@test.com" },
    });
  });

  //Unexpected error → 500
  it("returns 500 on unexpected error", async () => {
    req.body = { email: "admin@test.com", password: "pass" };

    supabase.auth.signInWithPassword.mockRejectedValue(
      new Error("Supabase down")
    );

    await adminLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error",
    });
  });
});
