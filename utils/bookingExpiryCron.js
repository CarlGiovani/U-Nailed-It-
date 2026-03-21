import cron from "node-cron";
import { expirePendingBookings } from "./expirePendingBookings.js";
// adjust path depende sa folder mo

export const scheduleBookingExpiry = () => {
  // runs every minute (recommended). pwede */5 for every 5 minutes
  cron.schedule("0 1 * * * *", async () => {
    console.log("[CRON] Running booking expiry cleanup...");

    try {
      await expirePendingBookings();
      console.log("[CRON] Booking expiry cleanup done");
    } catch (err) {
      console.error("[CRON ERROR - booking expiry]", err);
    }
  });
};
