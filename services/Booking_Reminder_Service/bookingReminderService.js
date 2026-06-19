import supabase from "../../utils/supabaseClient.js";
import sendEmail from "../Email_Feature/emailService.js";

/* =========================
   PHILIPPINES DATE/TIME HELPERS
========================= */
const formatPhilippineDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatPhilippineTime = (timeString) => {
  if (!timeString) return "";
  try {
    let date;
    if (timeString.includes("T") || timeString.includes(":")) {
      date = new Date(`2000-01-01T${timeString}`);
      if (isNaN(date.getTime())) date = new Date(timeString);
    } else {
      date = new Date(`2000-01-01T${timeString}`);
    }
    if (isNaN(date.getTime())) return timeString;
    return date.toLocaleTimeString("en-PH", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeString;
  }
};

const toManilaDateTime = (bookingDate, bookingTime) => {
  return new Date(`${bookingDate}T${bookingTime}+08:00`);
};

/* =========================
   SHARED EMAIL UI (MODERN DESIGN) - ONLY 2 BUTTONS
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
  footerText = "Please arrive on time. We look forward to seeing you.",
  studioAddress = "89-A P. Zamora Street, West Rembo, Taguig City, Metro Manila, Philippines",
  supportEmail = "unaileditbyalliyah@gmail.com",
}) => {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    studioAddress,
  )}`;
  const mailTo = `mailto:${supportEmail}?subject=Appointment Inquiry&body=Hello! I have a question about my upcoming appointment.`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${titlePink} ${titleDark} — UNailedit</title>
  <style>
    @media only screen and (max-width: 600px) {
      .responsive-container { width: 100% !important; }
      .inner-padding { padding: 28px 20px !important; }
      .btn { display: block !important; width: 80% !important; margin: 12px auto !important; text-align: center !important; }
      .details-cell { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#F4F1EA; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F1EA; padding:40px 0 50px 0;">
    <tr>
      <td align="center">
        <table width="600" class="responsive-container" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#FFFFFF; border-radius:28px; box-shadow:0 20px 35px -10px rgba(0,0,0,0.1); overflow:hidden;">
          
          <!-- HEADER (gradient) -->
          <tr>
            <td style="background: linear-gradient(135deg, #E8A1B2 0%, #C9A24D 100%); padding: 30px 24px; text-align: center;">
              <span style="font-size: 14px; letter-spacing: 3px; font-weight: 700; color: #1F1A15; text-transform: uppercase; background: rgba(255,255,240,0.2); padding: 6px 14px; border-radius: 40px; display: inline-block;">${eyebrow}</span>
              <h1 style="font-size: 32px; font-weight: 800; margin: 18px 0 0 0; color: #1F1A15; letter-spacing: -0.5px;">${titlePink} <span style="color: #FFF3E0;">${titleDark}</span> ${emoji}</h1>
            </td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td class="inner-padding" style="padding: 40px 36px 36px 36px;">
              
              <p style="font-size: 18px; font-weight: 500; margin: 0 0 6px 0; color: #2C241A;">Hi, <span style="color:#C17B8C;">${name}</span> 👋</p>
              <p style="font-size: 16px; line-height: 1.5; color: #4A3F32; margin: 6px 0 20px 0;">${intro}</p>
              
              <div style="width: 60px; height: 3px; background: #E8A1B2; margin: 12px 0 28px 0; border-radius: 4px;"></div>

              <!-- DETAILS CARD -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FFF9F7; border-radius: 24px; border: 1px solid #FFE6E0; margin-bottom: 28px;">
                <tr>
                  <td class="details-cell" style="padding: 22px 24px;">
                    <p style="font-size: 12px; letter-spacing: 1.2px; font-weight: 700; color: #C9A24D; text-transform: uppercase; margin: 0 0 12px 0;">📋 APPOINTMENT DETAILS</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr><td width="90" style="padding-bottom: 12px;"><strong style="color:#2C241A;">💆 Service</strong></td><td style="padding-bottom: 12px;">${service}</td></tr>
                      <tr><td style="padding-bottom: 12px;"><strong style="color:#2C241A;">📅 Date</strong></td><td style="padding-bottom: 12px;">${date || "TBD"}</td></tr>
                      <tr><td style="padding-bottom: 12px;"><strong style="color:#2C241A;">⏰ Time</strong></td><td style="padding-bottom: 12px;">${time || "TBD"} <span style="font-size:13px; color:#A1866B;">(PHT)</span></td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- NOTE BOX -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FEFAF5; border-left: 5px solid #E8A1B2; border-radius: 18px; margin: 12px 0 18px;">
                <tr><td style="padding: 18px 22px;"><p style="margin:0; font-size:14px; line-height:1.45; color:#4A3F32;">${note}</p></td></tr>
              </table>

              <!-- TWO BUTTONS: LOCATION + CONTACT SUPPORT -->
              <div style="text-align: center; margin: 20px 0 28px 0;">
                <a href="${mapsUrl}" style="display: inline-block; background: #E8A1B2; padding: 14px 28px; border-radius: 50px; text-decoration: none; color: #1F1A15; font-weight: 700; font-size: 15px; margin: 0 8px 12px 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">📍 View Location</a>
                <a href="${mailTo}" style="display: inline-block; background: #C9A24D; padding: 14px 28px; border-radius: 50px; text-decoration: none; color: #1F1A15; font-weight: 700; font-size: 15px; margin: 0 8px 12px 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">✉️ Contact Support</a>
              </div>

              <p style="font-size: 13px; color: #967A62; border-top: 1px solid #F0E4DA; padding-top: 18px; margin-top: 18px;">${footerText}</p>
              
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background: #FEFAF5; padding: 18px 20px; border-top: 1px solid #F1E6DC;">
              <p style="margin:0; font-size:12px; color:#A88E76;">© ${new Date().getFullYear()} UNailedit by Alliyah — Glow with confidence ✨</p>
              <p style="margin:8px 0 0 0; font-size:11px; color:#BCA48C;">Thank you for choosing UNailedit</p>
            </td>
          </tr>
        </table>
      </table>
    </tr>
  </table>
</body>
</html>
`;
};

/* =========================
   REMINDER TEMPLATES (with normalized date/time)
========================= */
const bookingReminder24hTemplate = ({
  name = "Customer",
  service = "your service",
  date = "",
  time = "",
  supportEmail = "unaileditbyalliyah@gmail.com",
}) => {
  const normalizedDate = formatPhilippineDate(date);
  const normalizedTime = formatPhilippineTime(time);

  return emailShell({
    eyebrow: "24 HOUR REMINDER",
    titlePink: "Appointment",
    titleDark: "Reminder",
    emoji: "💅",
    intro:
      "This is a friendly reminder that your appointment is coming up within the next 24 hours.",
    name,
    service,
    date: normalizedDate,
    time: normalizedTime,
    note: "⏰ Please arrive on time. If you need to reschedule, please contact us as soon as possible.",
    footerText: "We’re excited to see you soon at UNailedit.",
    supportEmail,
  });
};

const bookingReminderSameDayTemplate = ({
  name = "Customer",
  service = "your service",
  date = "",
  time = "",
  supportEmail = "unaileditbyalliyah@gmail.com",
}) => {
  const normalizedDate = formatPhilippineDate(date);
  const normalizedTime = formatPhilippineTime(time);

  return emailShell({
    eyebrow: "TODAY'S APPOINTMENT",
    titlePink: "Your Appointment",
    titleDark: "Is Today",
    emoji: "✨",
    intro:
      "This is a quick reminder that your appointment is scheduled for today.",
    name,
    service,
    date: normalizedDate,
    time: normalizedTime,
    note: "📍 Please arrive a few minutes early. We look forward to seeing you!",
    footerText: "Thank you for choosing UNailedit.",
    supportEmail,
  });
};

/* =========================
   24H REMINDER (sending logic)
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
    .select(
      `
      id,
      customer_name,
      customer_email,
      booking_date,
      booking_time,
      reminder_24h_sent_at,
      status,
      services (id, name)
    `,
    )
    .eq("status", "approved")
    .is("reminder_24h_sent_at", null)
    .not("customer_email", "is", null)
    .gte("booking_date", todayManila)
    .lte("booking_date", tomorrowManila);

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
          date: booking.booking_date,
          time: booking.booking_time,
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
   SAME DAY REMINDER (sending logic)
========================= */
export const sendSameDayReminders = async () => {
  const now = new Date();
  const next3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);

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
      services (id, name)
    `,
    )
    .eq("status", "approved")
    .eq("booking_date", todayInManila)
    .is("reminder_same_day_sent_at", null)
    .not("customer_email", "is", null);

  if (error) throw new Error(error.message);

  let sentCount = 0;

  for (const booking of bookings || []) {
    const appointmentDateTime = toManilaDateTime(
      booking.booking_date,
      booking.booking_time,
    );

    // SEND ONLY IF APPOINTMENT IS WITHIN NEXT 3 HOURS
    if (appointmentDateTime > now && appointmentDateTime <= next3h) {
      await sendEmail({
        to: booking.customer_email,
        subject: "Reminder: Your appointment is today",
        html: bookingReminderSameDayTemplate({
          name: booking.customer_name || "Customer",
          service: booking.services?.name || "Your Service",
          date: booking.booking_date,
          time: booking.booking_time,
        }),
      });

      await supabase
        .from("bookings")
        .update({ reminder_same_day_sent_at: new Date().toISOString() })
        .eq("id", booking.id);

      sentCount++;
    }
  }

  return sentCount;
};
