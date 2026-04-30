import resend from "resend";
import { getCurrentEmailSettings } from "./emailSettingsService.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  let senderName = "UNailed It";

  try {
    const dbSettings = await getCurrentEmailSettings();
    if (dbSettings?.sender_name) {
      senderName = dbSettings.sender_name;
    }
  } catch (err) {
    console.warn("Email settings load failed, using fallback");
  }

  await resend.emails.send({
    from: `${senderName} <onboarding@resend.dev>`,
    to,
    subject,
    html,
    attachments,
  });
};

export default sendEmail;