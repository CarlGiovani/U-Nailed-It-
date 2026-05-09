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
   SHARED EMAIL UI
========================= */
const emailShell = ({
  eyebrow = "APPOINTMENT REMINDER",
  titlePink = "Appointment",
  titleDark = "Reminder",
  emoji = "💅",
  intro = "",
  name = "Customer",
  service = "your service",
  date = "",
  time = "",
  note = "",
  buttonText = "View Booking",
  buttonLink = "#",
  footerText = "Please arrive on time. We look forward to seeing you.",
  studioAddress = "H338+Q9V, 118 San Guillermo Ave, Pasig, 1600 Metro Manila",
}) => {

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    studioAddress
  )}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${titlePink} ${titleDark}</title>
</head>

<body style="margin:0; padding:0; background-color:#f2f2f2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2; padding:30px 0;">
    <tr>
      <td align="center">
        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          style="
            max-width:600px;
            width:100%;
            border-radius:18px;
            overflow:hidden;
            background:#ffffff;
            box-shadow:0 12px 35px rgba(0,0,0,0.15);
          "
        >
          <!-- Header -->
          <tr>
            <td
              style="
                padding:20px;
                text-align:center;
                background: linear-gradient(to right, #E8A1B2, #C9A24D);
              "
            >
              <span
                style="
                  font-family:Arial, Helvetica, sans-serif;
                  font-size:13px;
                  letter-spacing:2px;
                  font-weight:bold;
                  color:#111111;
                "
              >
                ${eyebrow}
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px; font-family:Arial, Helvetica, sans-serif; color:#111111;">
              <h2 style="margin:0 0 8px 0; font-size:28px;">
                <span style="color:#E8A1B2;">${titlePink}</span>
                <span style="color:#111111;"> ${titleDark}</span> ${emoji}
              </h2>

              <div style="width:70px;height:4px;background:#C9A24D;border-radius:10px;margin:0 0 18px 0;"></div>

              <p style="margin:0 0 12px 0; font-size:15px;">
                Hi <b>${name}</b>,
              </p>

              <p style="margin:0 0 22px 0; font-size:15px; line-height:1.7; color:#333;">
                ${intro}
              </p>

              <!-- Booking Details -->
              <table width="100%" style="background:#FFF6F8;border-left:4px solid #E8A1B2;border-radius:14px;margin:0 0 22px 0;">
                <tr>
                  <td style="padding:18px;">
                    <p style="margin:0 0 10px 0; font-size:13px; letter-spacing:1px; color:#7a4a57;">
                      APPOINTMENT DETAILS
                    </p>
                    <p style="margin:6px 0;"><b>Service:</b> ${service}</p>
                    <p style="margin:6px 0;"><b>Date:</b> ${date}</p>
                    <p style="margin:6px 0;"><b>Time:</b> ${time}</p>
                  </td>
                </tr>
              </table>

              <!-- Note -->
              <table width="100%" style="background:#fafafa;border-left:4px solid #C9A24D;border-radius:12px;margin-bottom:26px;">
                <tr>
                  <td style="padding:16px;font-size:14px;color:#333;">
                    ${note}
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              ${
                buttonLink && buttonLink !== "#"
                  ? `
              <table align="center">
                <tr>
                  <td style="background:#C9A24D;border-radius:30px;">
                    <a href="${buttonLink}"
                      style="display:inline-block;padding:14px 30px;color:#111;text-decoration:none;font-weight:bold;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <!-- 📍 NEW LOCATION BUTTON -->
              <table align="center" style="margin-top:12px;">
                <tr>
                  <td style="background:#E8A1B2;border-radius:30px;">
                    <a href="${mapsUrl}"
                      style="display:inline-block;padding:14px 30px;color:#111;text-decoration:none;font-weight:bold;">
                      📍 View Location
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:22px 0 0 0;font-size:13px;color:#666;">
                ${footerText}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:18px;font-size:11px;color:#888;background:#fafafa;">
              © ${new Date().getFullYear()} UNailedit by Alliyah. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

/* =========================
   EMAIL TEMPLATES
========================= */
const bookingReminder24hTemplate = ({
  name = "Customer",
  service = "your service",
  date = "",
  time = "",
}) =>
  emailShell({
    eyebrow: "24 HOUR APPOINTMENT REMINDER",
    titlePink: "Appointment",
    titleDark: "Reminder",
    emoji: "💅",
    intro:
      "This is a friendly reminder that your appointment is coming up within the next 24 hours.",
    name,
    service,
    date,
    time,
    note: "Please arrive on time.",
    footerText: "We’re excited to see you soon at UNailedit.",
  });

const bookingReminderSameDayTemplate = ({
  name = "Customer",
  service = "your service",
  date = "",
  time = "",
}) =>
  emailShell({
    eyebrow: "TODAY'S APPOINTMENT REMINDER",
    titlePink: "Your Appointment",
    titleDark: "Is Today",
    emoji: "✨",
    intro:
      "This is a quick reminder that your appointment is scheduled for today.",
    name,
    service,
    date,
    time,
    note: "Please arrive a few minutes early.",
    footerText: "Thank you for choosing UNailedit.",
  });

/* =========================
   24H REMINDER
========================= */
export const send24hReminders = async () => {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const todayManila = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const tomorrowManila = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(next24h);

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      customer_name,
      customer_email,
      booking_date,
      booking_time,
      reminder_24h_sent_at,
      status,
      services (id, name)
    `)
    .eq("status", "approved")
    .is("reminder_24h_sent_at", null)
    .not("customer_email", "is", null)
    .gte("booking_date", todayManila)
    .lte("booking_date", tomorrowManila); // ← IMPORTANT SEMICOLON

  if (error) throw new Error(error.message);

  let sentCount = 0;

  for (const booking of bookings || []) {
    const appointmentDateTime = toManilaDateTime(
      booking.booking_date,
      booking.booking_time
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

      await supabase
        .from("bookings")
        .update({ reminder_24h_sent_at: new Date().toISOString() })
        .eq("id", booking.id);

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
    .select(`
      id,
      customer_name,
      customer_email,
      booking_date,
      booking_time,
      reminder_same_day_sent_at,
      status,
      services (id, name)
    `)
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

    await supabase
      .from("bookings")
      .update({ reminder_same_day_sent_at: new Date().toISOString() })
      .eq("id", booking.id);

    sentCount++;
  }

  return sentCount;
};