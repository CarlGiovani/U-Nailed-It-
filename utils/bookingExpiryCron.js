import cron from "node-cron";
import supabase from "./supabaseClient.js";

let isRunning = false;

export const scheduleBookingExpiry = () => {
  cron.schedule("* * * * *", async () => {
    if (isRunning) return;
    isRunning = true;

    console.log("[CRON] Running booking expiry cleanup...");

    const now = new Date().toISOString();

    try {
      const { error: bookingErr } = await supabase
        .from("bookings")
        .update({ status: "expired" })
        .eq("status", "pending_payment")
        .lt("expires_at", now)
        .select("id");

      if (bookingErr) {
        console.error("Expire bookings error:", bookingErr.message);
      }

      const { error: intentErr } = await supabase
        .from("payment_intents")
        .update({ status: "expired" })
        .eq("status", "pending")
        .lt("expires_at", now)
        .select("id");

      if (intentErr) {
        console.error("Expire intents error:", intentErr.message);
      }

      console.log("[CRON] Booking expiry cleanup done");
    } catch (err) {
      console.error("[CRON ERROR - booking expiry]", err);
    } finally {
      isRunning = false;
    }
  });
};
