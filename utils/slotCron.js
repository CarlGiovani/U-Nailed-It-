import cron from "node-cron";
import formatLocalDate from "./dateFormatter.js";
import supabase from "./supabaseClient.js";

export const scheduleSlotCleanup = () => {
  cron.schedule("0 1 * * *", async () => {
    const now = new Date();
    const todayStr = formatLocalDate(now);
    const currentTime = now.toTimeString().slice(0, 5);

    console.log(`[CRON] Running slot cleanup. Today: ${todayStr}`);

    try {
      //Get past slots
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
          .in("status", ["pending_approval", "approved"])
          .maybeSingle();

        if (!booking) {
          await supabase.from("calendar_slots").delete().eq("id", slot.id);

          deletedCount++;
        }
      }

      console.log(`[CRON] Deleted unused past slots: ${deletedCount}`);

      // Block past times today
      const { data: todayData, error: todayError } = await supabase
        .from("calendar_slots")
        .update({ is_available: false })
        .eq("date", todayStr)
        .lt("time", currentTime)
        .select();

      if (todayError) throw todayError;

      console.log(`[CRON] Today past slots blocked: ${todayData.length}`);
    } catch (err) {
      console.error("[CRON ERROR]", err);
    }
  });
};
