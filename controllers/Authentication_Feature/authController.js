import supabase from "../../utils/supabaseClient.js";


// ADMIN LOGIN
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.json({
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
