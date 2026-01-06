import supabase from "../../utils/supabaseClient.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Expected format: Bearer <token>
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Malformed token" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // attach user to request
    req.user = data.user;

    next();
  } catch (err) {
    console.error("Verify admin error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
