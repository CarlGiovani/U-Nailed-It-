import createEmailTransporter from "../../utils/createEmailTransporter.js";
import { getCurrentEmailSettingsWithPassword } from "./emailSettingsService.js";

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  let config;

  try {
    const dbSettings = await getCurrentEmailSettingsWithPassword();

    if (dbSettings) {
      config = {
        sender_name: dbSettings.sender_name,
        email_user: dbSettings.email_user,
        email_app_password: dbSettings.email_app_password,
      };
    }
  } catch (error) {
    console.warn(
      "⚠️ Failed to load DB email settings, using fallback:",
      error.message,
    );
  }

  if (!config) {
    config = {
      sender_name: "UNailed It",
      email_user: process.env.EMAIL_USER,
      email_app_password: process.env.EMAIL_APP_PASSWORD,
    };
  }

  const transporter = createEmailTransporter({
    email_user: config.email_user,
    email_app_password: config.email_app_password,
  });

  await transporter.sendMail({
    from: `"${config.sender_name}" <${config.email_user}>`,
    to,
    subject,
    html,
    attachments,
  });
};

export default sendEmail;
