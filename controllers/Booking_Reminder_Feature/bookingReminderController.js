import { sendSameDayReminders, send24hReminders } from "../../services/Booking_Reminder_Service/bookingReminderService.js";


export const runBookingReminderJob = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET_REMINDERS_NOTIF}`) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const sent24h = await send24hReminders();
    const sentSameDay = await sendSameDayReminders();

    return res.status(200).json({
      message: "Booking reminder job executed successfully",
      sent24h,
      sentSameDay,
      totalSent: sent24h + sentSameDay,
    });
  } catch (error) {
    console.error("Booking reminder job error:", error);

    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};