import supabase from "../../utils/supabaseClient.js";
import formatLocalDate from "../../utils/dateFormatter.js";

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

    const now = new Date().toISOString();

    const { data: expiredBookings, error: bookingErr } = await supabase
      .from("bookings")
      .update({ status: "expired" })
      .eq("status", "pending_payment")
      .lt("expires_at", now)
      .select("id");

    if (bookingErr) {
      throw bookingErr;
    }

    const { data: expiredIntents, error: intentErr } = await supabase
      .from("payment_intents")
      .update({ status: "expired" })
      .eq("status", "pending")
      .lt("expires_at", now)
      .select("id");

    if (intentErr) {
      throw intentErr;
    }

    console.log("[JOB] Booking expiry cleanup done");

    return res.status(200).json({
      success: true,
      message: "Booking expiry cleanup done",
      expiredBookings: expiredBookings?.length || 0,
      expiredIntents: expiredIntents?.length || 0,
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

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    console.log(
      `[CRON] Slot block started | Date: ${todayStr} | Time: ${currentTime}`,
    );

    const { data: updatedSlots, error } = await supabase
      .from("calendar_slots")
      .update({ is_available: false })
      .eq("date", todayStr)
      .lt("time", currentTime)
      .eq("is_available", true)
      .select("id, time");

    if (error) throw error;

    console.log(
      `[CRON] Slot block done | blocked: ${updatedSlots?.length || 0}`,
    );

    return res.status(200).json({
      success: true,
      message: "Slot block job executed",
      blocked: updatedSlots?.length || 0,
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

    const now = new Date();
    const todayStr = formatLocalDate(now);

    console.log(
      `[CRON] Slot cleanup started | Date: ${todayStr} | Time: ${now.toLocaleTimeString()}`,
    );

    const { data: pastSlots, error: pastError } = await supabase
      .from("calendar_slots")
      .select("id, date, time")
      .lt("date", todayStr);

    if (pastError) throw pastError;

    const totalPastSlots = pastSlots?.length || 0;
    let deletedCount = 0;
    let keptCount = 0;

    for (const slot of pastSlots || []) {
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("id")
        .eq("booking_date", slot.date)
        .eq("booking_time", slot.time)
        .in("status", ["pending_approval", "approved", "completed"])
        .maybeSingle();

      if (bookingError) throw bookingError;

      if (!booking) {
        const { error: deleteError } = await supabase
          .from("calendar_slots")
          .delete()
          .eq("id", slot.id);

        if (deleteError) throw deleteError;

        deletedCount++;
      } else {
        keptCount++;
      }
    }

    console.log(
      `[CRON] Slot cleanup done | checked: ${totalPastSlots} | deleted: ${deletedCount} | kept: ${keptCount}`,
    );

    return res.status(200).json({
      success: true,
      message: "Slot cleanup job executed",
      checked: totalPastSlots,
      deleted: deletedCount,
      kept: keptCount,
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
