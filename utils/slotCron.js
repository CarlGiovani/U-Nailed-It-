import cron from "node-cron";
import supabase from "./supabaseClient.js";
import formatLocalDate from "./dateFormatter.js"; // kung meron ka nang date formatter

export const scheduleSlotCleanup = () => {
  // Tatakbo araw-araw sa 12:05 AM (pwede baguhin ang oras)
  cron.schedule("5 0 * * *", async () => {
    const now = new Date();
    const todayStr = formatLocalDate(now); // YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm

    console.log(`[CRON] Running slot cleanup. Today: ${todayStr}, Current Time: ${currentTime}`);

    try {
      // 1️⃣ Block all past dates
      const { data: pastDatesData, error: pastDatesError } = await supabase
        .from("calendar_slots")
        .update({ is_available: false })
        .lt("date", todayStr)
        .select();

      if (pastDatesError) console.error("[CRON ERROR - past dates]", pastDatesError.message);
      else console.log(`[CRON] Past dates blocked: ${pastDatesData.length}`);

      // 2️⃣ Block past times in current day
      const { data: todayData, error: todayError } = await supabase
        .from("calendar_slots")
        .update({ is_available: false })
        .eq("date", todayStr)
        .lt("time", currentTime)
        .select();

      if (todayError) console.error("[CRON ERROR - today past times]", todayError.message);
      else console.log(`[CRON] Today past slots blocked: ${todayData.length}`);

    } catch (err) {
      console.error("[CRON ERROR]", err);
    }
  });
};
