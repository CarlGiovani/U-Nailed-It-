import {
  createAdminAuthUser,
  deleteAdminAuthUser,
  getAdminProfileById,
  sendPasswordResetEmail,
  signInAdmin,
  updateAdminPasswordById,
  upsertAdminProfile,
} from "../../models/Admin_Auth_Feature/adminAuthModel.js";

import {
  adminCreateAccountSchema,
  adminLoginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  validate,
} from "../../utils/validators/authValidation.js";

import { createClient } from "@supabase/supabase-js";

/* =========================
   CREATE ACCOUNT
========================= */
export const adminCreateAccount = async (req, res) => {
  try {
    const errors = validate(adminCreateAccountSchema, req.body);

    if (errors) {
      return res.status(400).json({
        error: errors[0],
        errors,
      });
    }

    const { email, password, username, full_name } = req.body;

    const { data, error } = await createAdminAuthUser({
      email,
      password,
      username,
      full_name,
    });

    if (error || !data?.user) {
      return res.status(400).json({
        error: error?.message || "Failed to create admin account",
      });
    }

    const { error: profileError } = await upsertAdminProfile({
      id: data.user.id,
      email,
      username,
      full_name,
    });

    if (profileError) {
      await deleteAdminAuthUser(data.user.id);

      return res.status(400).json({
        error: profileError.message,
      });
    }

    return res.status(201).json({
      message: "Admin account created successfully",
      user: data.user,
    });
  } catch (err) {
    console.error("Create admin account error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* =========================
   ADMIN LOGIN
========================= */
export const adminLogin = async (req, res) => {
  try {
    const errors = validate(adminLoginSchema, req.body);

    if (errors) {
      return res.status(400).json({
        error: errors[0],
        errors,
      });
    }

    const { email, password } = req.body;

    const { data, error } = await signInAdmin({ email, password });

    if (error) {
      return res.status(401).json({
        error: error.message,
      });
    }

    const { data: profile, error: profileError } = await getAdminProfileById(
      data.user.id,
    );

    if (profileError || !profile) {
      return res.status(403).json({
        error: "Admin profile not found",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      session: data.session,
      user: data.user,
      profile,
    });
  } catch (err) {
    console.error("Admin login error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* =========================
   ADMIN LOGOUT
========================= */
export const adminLogout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (token) {
        const supabaseUserClient = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_KEY,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          },
        );

        await supabaseUserClient.auth.signOut();
      }
    }

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);

    return res.status(200).json({
      message: "Logged out successfully",
    });
  }
};
/* =========================
   FORGOT PASSWORD
========================= */
export const forgotPassword = async (req, res) => {
  try {
    const errors = validate(forgotPasswordSchema, req.body);

    if (errors) {
      return res.status(400).json({
        error: errors[0],
        errors,
      });
    }

    const { email } = req.body;

    const redirectTo =
      process.env.ADMIN_RESET_PASSWORD_URL ||
      "http://localhost:5174/reset-password";

    const { error } = await sendPasswordResetEmail({
      email,
      redirectTo,
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Password reset email sent",
    });
  } catch (err) {
    console.error("Forgot password error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* =========================
   CHANGE PASSWORD
========================= */

export const changePassword = async (req, res) => {
  try {
    const errors = validate(changePasswordSchema, req.body);

    if (errors) {
      return res.status(400).json({
        error: errors[0],
        errors,
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { newPassword } = req.body;

    const { data, error } = await updateAdminPasswordById(
      req.user.id,
      newPassword,
    );

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Password updated successfully",
      user: data.user,
    });
  } catch (err) {
    console.error("Change password error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
/* =========================
   GET CURRENT ADMIN PROFILE
========================= */
export const getCurrentAdminProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { data: profile, error } = await getAdminProfileById(req.user.id);

    if (error || !profile) {
      return res.status(404).json({
        error: "Admin profile not found",
      });
    }

    return res.status(200).json({
      profile,
    });
  } catch (err) {
    console.error("Get current admin profile error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
