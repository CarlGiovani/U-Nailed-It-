
import supabase from "../../utils/supabaseClient.js";

// CREATE ACCOUNT
export const adminCreateAccount = async (req, res) => {
  try {
    const { email, password, username, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: username || null,
        full_name: full_name || null,
      },
    });

    if (error || !data?.user) {
      return res.status(400).json({
        error: error?.message || "Failed to create admin account",
      });
    }

    const { error: profileError } = await supabaseAdmin
      .from("admin_profiles")
      .upsert({
        id: data.user.id,
        email,
        username: username || null,
        full_name: full_name || null,
        role: "admin",
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);

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


// ADMIN LOGIN
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Login successful",
      session: data.session,
      user: data.user,
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
    const { error } = await req.supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

/* =========================
   FORGOT PASSWORD
========================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const redirectTo =
      process.env.ADMIN_RESET_PASSWORD_URL ||
      "http://localhost:5174/reset-password";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        error: "New password is required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    const { data: userData, error: userError } =
      await req.supabase.auth.getUser();

    if (userError || !userData?.user) {
      return res.status(401).json({
        error: "Unauthorized or invalid session",
      });
    }

    const { data, error } = await req.supabase.auth.updateUser({
      password: newPassword,
    });

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
