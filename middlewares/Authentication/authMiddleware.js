import { createClient } from "@supabase/supabase-js";
import supabase from "../../utils/supabaseClient.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Malformed token" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Malformed token" });
    }

    // User-scoped client only for validating the token/user identity
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabaseUserClient.auth.getUser();

    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = data.user;

    // Use backend service-role client for admin profile lookup
    const { data: adminProfile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("id, email, role, username, full_name")
      .eq("id", user.id)
      .single();

    if (profileError || !adminProfile) {
      return res.status(403).json({
        error: "Access denied. Admin profile not found.",
      });
    }

    if (adminProfile.role !== "admin") {
      return res.status(403).json({
        error: "Access denied. Admins only.",
      });
    }

    req.user = user;
    req.admin = adminProfile;

    // wag mo na i-attach yung req.supabase = supabaseUserClient
    next();
  } catch (err) {
    console.error("Verify admin error:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
