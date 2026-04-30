import gmail from "../../utils/gmailClient.js";
import { getCurrentEmailSettingsWithPassword } from "./emailSettingsService.js";

const encodeMessage = (raw) => {
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const sendEmail = async ({ to, subject, html }) => {
  let config;

  try {
    const dbSettings = await getCurrentEmailSettingsWithPassword();

    if (dbSettings) {
      config = {
        sender_name: dbSettings.sender_name,
      };
    }
  } catch (error) {
    console.warn(
      "⚠️ Failed to load DB email settings, using fallback:",
      error.message
    );
  }

  if (!config) {
    config = {
      sender_name: "UNailed It",
    };
  }

  const senderName = config.sender_name;

  // Gmail raw email format
  const rawMessage = [
    `From: "${senderName}" <me>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
  ].join("\n");

  const encodedMessage = encodeMessage(rawMessage);

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
};

export default sendEmail;