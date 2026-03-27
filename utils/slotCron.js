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
    if (isCleanupRunning) return;
    isCleanupRunning = true;

    const now = new Date();
    const todayStr = formatLocalDate(now);

    console.log(`[CRON CLEANUP] Running. Today: ${todayStr}`);

    try {
      const { data: pastSlots, error: pastError } = await supabase
        .from("calendar_slots")
        .select("id, date, time")
        .lt("date", todayStr);

      if (pastError) throw pastError;

      let deletedCount = 0;

      for (const slot of pastSlots) {
        const { data: booking } = await supabase
          .from("bookings")
          .select("id")
          .eq("booking_date", slot.date)
          .eq("booking_time", slot.time)
          .in("status", ["pending_approval", "approved", "completed"])
          .maybeSingle();

        if (!booking) {
          await supabase.from("calendar_slots").delete().eq("id", slot.id);

          deletedCount++;
        }
      }

      console.log(`[CRON CLEANUP] Deleted slots: ${deletedCount}`);
    } catch (err) {
      console.error("[CRON CLEANUP ERROR]", err);
    } finally {
      isCleanupRunning = false;
    }
  });

  // =========================
  // BLOCK PAST TIMES (EVERY 5 MINUTES)
  // =========================
  cron.schedule("*/5 * * * *", async () => {
    if (isBlockRunning) return;
    isBlockRunning = true;

    const now = new Date();
    const todayStr = formatLocalDate(now);
    const currentTime = now.toTimeString().slice(0, 5);

    console.log(
      `[CRON BLOCK] Running. Today: ${todayStr}, Time: ${currentTime}`,
    );

    try {
      const { data: todayData, error: todayError } = await supabase
        .from("calendar_slots")
        .update({ is_available: false })
        .eq("date", todayStr)
        .lt("time", currentTime)
        .eq("is_available", true) 
        .select();

      if (todayError) throw todayError;

      console.log(`[CRON BLOCK] Newly blocked slots: ${todayData.length}`);
    } catch (err) {
      console.error("[CRON BLOCK ERROR]", err);
    } finally {
      isBlockRunning = false;
    }
  });
};
