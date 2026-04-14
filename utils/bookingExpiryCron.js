import cron from "node-cron";
import supabase from "../utils/supabaseClient.js";

export const scheduleBookingExpiry = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const phDate = now.toLocaleDateString("en-CA", {
        timeZone: "Asia/Manila",
      });
      const phTime = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Manila",
        hour12: false,
      });

      console.log(
        `[CRON BLOCK] Started | Date: ${phDate} | Current Time: ${phTime}`,
      );
      console.log("[CRON] Running booking expiry cleanup...");

      const { data, error } = await supabase.rpc("expire_pending_bookings");

      if (error) {
        console.error("Expire bookings error:", error.message);
      } else {
        console.log(`[CRON] Expired bookings: ${data}`);
      }

      console.log("[CRON] Booking expiry cleanup done");
    } catch (err) {
      console.error("[CRON] Unexpected error:", err.message);
    }
  });
};
