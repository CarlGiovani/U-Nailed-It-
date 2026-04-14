import supabase from "../../utils/supabaseClient.js";

let isRunning = false;

export const runBookingExpiryManually = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET_BOOKING_EXPIRY}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (isRunning) {
      return res.status(200).json({
        message: "Skipped: previous booking expiry job is still running.",
      });
    }

    isRunning = true;

    console.log("[JOB] Running booking expiry cleanup...");

    const { data, error } = await supabase.rpc("expire_pending_bookings");

    if (error) throw error;

    console.log("[JOB] Booking expiry cleanup done", data);

    return res.status(200).json({
      success: true,
      message: "Booking expiry cleanup done",
      expiredBookings: data?.expired_bookings || 0,
      expiredIntents: data?.expired_intents || 0,
    });
  } catch (err) {
    console.error("[JOB ERROR - booking expiry]", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  } finally {
    isRunning = false;
  }
};

let isBlockRunning = false;

export const runSlotBlockJob = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET_BLOCK}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (isBlockRunning) {
      console.log("[CRON] Slot block skipped (already running)");
      return res.status(200).json({
        message: "Skipped: previous slot block job is still running.",
      });
    }

    isBlockRunning = true;

    console.log("[CRON] Slot block started...");

    const { data, error } = await supabase.rpc("block_past_today_slots");

    if (error) throw error;

    console.log("[CRON] Slot block done", data);

    return res.status(200).json({
      success: true,
      message: "Slot block job executed",
      date: data?.date || null,
      time: data?.time || null,
      blocked: data?.blocked || 0,
    });
  } catch (err) {
    console.error("[CRON ERROR - slot block]", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  } finally {
    isBlockRunning = false;
  }
};

let isCleanupRunning = false;

export const runSlotCleanupJob = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET_CLEANUP}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (isCleanupRunning) {
      return res.status(200).json({
        message: "Skipped: previous slot cleanup job is still running.",
      });
    }

    isCleanupRunning = true;

    console.log("[CRON] Slot cleanup started...");

    const { data, error } = await supabase.rpc("cleanup_old_slots");

    if (error) throw error;

    console.log("[CRON] Slot cleanup done", data);

    return res.status(200).json({
      success: true,
      message: "Slot cleanup job executed",
      date: data?.date || null,
      checked: data?.checked || 0,
      deleted: data?.deleted || 0,
      kept: data?.kept || 0,
    });
  } catch (err) {
    console.error("[CRON ERROR - slot cleanup]", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  } finally {
    isCleanupRunning = false;
  }
};
