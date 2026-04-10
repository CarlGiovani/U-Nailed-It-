import supabase from "../../utils/supabaseClient.js";
import sendEmail from "../Email_Feature/emailService.js";

/* =========================
   HELPERS
========================= */
const toManilaDateTime = (bookingDate, bookingTime) => {
  return new Date(`${bookingDate}T${bookingTime}+08:00`);
};

const formatDisplayDate = (bookingDate) => {
  return bookingDate;
};

const formatDisplayTime = (bookingTime) => {
  return bookingTime;
};

/* =========================
   EMAIL TEMPLATES
   temporary simple templates muna
   pwede natin pagandahin sa Phase 3
========================= */
const bookingReminder24hTemplate = ({
  name = "Customer",
  service = "your service",
  date = "",
  time = "",
}) => `
  <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
    <h2>Appointment Reminder 💅</h2>
    <p>Hi <b>${name}</b>,</p>
    <p>This is a friendly reminder that your appointment is coming up within 24 hours.</p>
    <p><b>Service:</b> ${service}</p>
    <p><b>Date:</b> ${date}</p>
    <p><b>Time:</b> ${time}</p>
    <p>Please arrive on time. See you soon!</p>
  </div>
`;

const bookingReminderSameDayTemplate = ({
  name = "Customer",
  service = "your service",
  date = "",
  time = "",
}) => `
  <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
    <h2>Your Appointment is Today ✨</h2>
    <p>Hi <b>${name}</b>,</p>
    <p>This is a reminder that your appointment is scheduled for today.</p>
    <p><b>Service:</b> ${service}</p>
    <p><b>Date:</b> ${date}</p>
    <p><b>Time:</b> ${time}</p>
    <p>We’re excited to see you today!</p>
  </div>
`;

/* =========================
   24H REMINDER
========================= */
export const send24hReminders = async () => {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      customer_name,
      customer_email,
      booking_date,
      booking_time,
      reminder_24h_sent_at,
      status,
      services (
        id,
        name
      )
    `,
    )
    .eq("status", "approved")
    .is("reminder_24h_sent_at", null)
    .not("customer_email", "is", null);

  if (error) throw new Error(error.message);

  let sentCount = 0;

  for (const booking of bookings || []) {
    const appointmentDateTime = toManilaDateTime(
      booking.booking_date,
      booking.booking_time,
    );

    if (appointmentDateTime > now && appointmentDateTime <= next24h) {
      await sendEmail({
        to: booking.customer_email,
        subject: "Reminder: Your appointment is coming up",
        html: bookingReminder24hTemplate({
          name: booking.customer_name || "Customer",
          service: booking.services?.name || "Your Service",
          date: formatDisplayDate(booking.booking_date),
          time: formatDisplayTime(booking.booking_time),
        }),
      });

      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          reminder_24h_sent_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (updateError) throw new Error(updateError.message);

      sentCount++;
    }
  }

  return sentCount;
};

/* =========================
   SAME DAY REMINDER
========================= */
export const sendSameDayReminders = async () => {
  const now = new Date();

  const todayInManila = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      customer_name,
      customer_email,
      booking_date,
      booking_time,
      reminder_same_day_sent_at,
      status,
      services (
        id,
        name
      )
    `,
    )
    .eq("status", "approved")
    .eq("booking_date", todayInManila)
    .is("reminder_same_day_sent_at", null)
    .not("customer_email", "is", null);

  if (error) throw new Error(error.message);

  let sentCount = 0;

  for (const booking of bookings || []) {
    await sendEmail({
      to: booking.customer_email,
      subject: "Reminder: Your appointment is today",
      html: bookingReminderSameDayTemplate({
        name: booking.customer_name || "Customer",
        service: booking.services?.name || "Your Service",
        date: formatDisplayDate(booking.booking_date),
        time: formatDisplayTime(booking.booking_time),
      }),
    });

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        reminder_same_day_sent_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (updateError) throw new Error(updateError.message);

    sentCount++;
  }

  return sentCount;
};
