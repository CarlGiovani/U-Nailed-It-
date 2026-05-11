import cron from "node-cron";
import formatLocalDate from "./dateFormatter.js";
import supabase from "./supabaseClient.js";

let isCleanupRunning = false;
let isBlockRunning = false;

export const scheduleSlotCleanup = () => {
  // =========================
  // DAILY CLEANUP (MIDNIGHT)
  // =========================
  cron.schedule("0 0 * * *", async () => {
    if (isCleanupRunning) {
      ("[CRON CLEANUP] Skipped: previous cleanup is still running.");
      return;
    }

    isCleanupRunning = true;

    const now = new Date();
    const todayStr = formatLocalDate(now);

    (
      `[CRON CLEANUP] Started | Date: ${todayStr} | Time: ${now.toLocaleTimeString()}`,
    );

    try {
      const { data: pastSlots, error: pastError } = await supabase
        .from("calendar_slots")
        .select("id, date, time")
        .lt("date", todayStr);

      if (pastError) throw pastError;

      const totalPastSlots = pastSlots?.length || 0;
      let deletedCount = 0;
      let keptCount = 0;

      (
        `[CRON CLEANUP] Found ${totalPastSlots} past slot(s) to check.`,
      );

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

      (
        `[CRON CLEANUP] Finished | Checked: ${totalPastSlots} | Deleted: ${deletedCount} | Kept: ${keptCount}`,
      );
    } catch (err) {
      console.error(`[CRON CLEANUP ERROR] ${err.message || err}`);
    } finally {
      isCleanupRunning = false;
    }
  });

  // =========================
  // BLOCK PAST TIMES (EVERY 5 MINUTES)
  // =========================
  cron.schedule("*/5 * * * *", async () => {
    if (isBlockRunning) {
      ("[CRON BLOCK] Skipped: previous block job is still running.");
      return;
    }

    isBlockRunning = true;

    const now = new Date();
    const todayStr = formatLocalDate(now);
    const currentTime = now.toTimeString().slice(0, 5);

    (
      `[CRON BLOCK] Started | Date: ${todayStr} | Current Time: ${currentTime}`,
    );

    try {
      const { data: todayData, error: todayError } = await supabase
        .from("calendar_slots")
        .update({ is_available: false })
        .eq("date", todayStr)
        .lt("time", currentTime)
        .eq("is_available", true)
        .select("id, time");

      if (todayError) throw todayError;

      const blockedCount = todayData?.length || 0;

      (
        `[CRON BLOCK] Finished | Newly blocked slot(s): ${blockedCount}`,
      );

      if (blockedCount > 0) {
        (
          `[CRON BLOCK] Blocked times: ${todayData.map((slot) => slot.time).join(", ")}`,
        );
      }
    } catch (err) {
      console.error(`[CRON BLOCK ERROR] ${err.message || err}`);
    } finally {
      isBlockRunning = false;
    }
  });
};
