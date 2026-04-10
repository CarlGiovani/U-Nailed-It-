import { getAllAdmins } from "../../models/Admin_Gmail_Notif_Feature/adminGmailNotifModel.js";
import supabase from "../../utils/supabaseClient.js";
import sendEmail from "../Email_Feature/emailService.js";

export const createAdminNotifAndSendGmail = async ({
  type,
  title,
  message,
  link,
  related_entity,
  related_id,
}) => {
  const admins = await getAllAdmins();

  if (!admins.length) {
    throw new Error("No admin profiles found.");
  }

  const frontendUrl = process.env.ADMIN_FRONTEND_URL || "http://localhost:5174";
  const fullLink = link ? `${frontendUrl}${link}` : frontendUrl;

  const notifications = [];

  for (const admin of admins) {
    // 1. Create in-app notification for this admin
    const { data: notification, error: notifError } = await supabase
      .from("notifications")
      .insert({
        admin_id: admin.id,
        type,
        title,
        message,
        link: link || null,
        related_entity: related_entity || null,
        related_id: related_id || null,
      })
      .select()
      .single();

    if (notifError) {
      console.error(
        `FAILED TO CREATE NOTIFICATION FOR ADMIN ${admin.id}:`,
        notifError.message,
      );
      continue;
    }

    notifications.push(notification);

    // 2. Send Gmail only if admin has email
    if (!admin.email || !admin.email.trim()) {
      console.warn(`Skipping Gmail for admin ${admin.id}: no email defined`);
      continue;
    }

    try {
      await sendEmail({
        to: admin.email.trim(),
        subject: `[Admin Notification] ${title}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Admin Notification</title>
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
                font-family:Arial, Helvetica, sans-serif;
              "
            >
              <span
                style="
                  font-size:13px;
                  letter-spacing:2px;
                  font-weight:bold;
                  color:#111111;
                "
              >
                ADMIN NOTIFICATION
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px; font-family:Arial, Helvetica, sans-serif; color:#111111;">
              <h2 style="margin:0 0 8px 0; font-size:28px; line-height:1.2;">
                <span style="color:#E8A1B2;">New</span>
                <span style="color:#111111;"> Notification</span> 🔔
              </h2>

              <div
                style="
                  width:70px;
                  height:4px;
                  background:#C9A24D;
                  border-radius:10px;
                  margin:0 0 18px 0;
                "
              ></div>

              <p style="margin:0 0 10px 0; font-size:15px; color:#333;">
                Hello Admin,
              </p>

              <p style="margin:0 0 22px 0; font-size:15px; line-height:1.7; color:#333;">
                You have received a new system notification in the admin panel.
              </p>

              <!-- Title box -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  background:#FFF6F8;
                  border-left:4px solid #E8A1B2;
                  border-radius:14px;
                  margin:0 0 18px 0;
                  border:1px solid #f1d7dd;
                "
              >
                <tr>
                  <td style="padding:18px;">
                    <p style="margin:0 0 8px 0; font-size:13px; letter-spacing:1px; color:#7a4a57;">
                      NOTIFICATION TITLE
                    </p>
                    <p style="margin:0; font-size:18px; font-weight:bold; color:#111111;">
                      ${title}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Message box -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  background:#fafafa;
                  border-left:4px solid #C9A24D;
                  border-radius:12px;
                  margin:0 0 20px 0;
                  border:1px solid #eee;
                "
              >
                <tr>
                  <td style="padding:16px; font-size:14px; color:#333; line-height:1.7;">
                    ${message}
                  </td>
                </tr>
              </table>

              <!-- Meta -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  margin:0 0 24px 0;
                  border-collapse:collapse;
                "
              >
                <tr>
                  <td style="padding:10px 0; font-size:14px; color:#333; font-family:Arial, Helvetica, sans-serif;">
                    <b>Type:</b> ${type}
                  </td>
                </tr>
                ${
                  related_entity
                    ? `
                <tr>
                  <td style="padding:4px 0; font-size:14px; color:#333; font-family:Arial, Helvetica, sans-serif;">
                    <b>Related Entity:</b> ${related_entity}
                  </td>
                </tr>
                `
                    : ""
                }
                ${
                  related_id
                    ? `
                <tr>
                  <td style="padding:4px 0; font-size:14px; color:#333; font-family:Arial, Helvetica, sans-serif;">
                    <b>Related ID:</b> ${related_id}
                  </td>
                </tr>
                `
                    : ""
                }
              </table>

              ${
                link
                  ? `
              <table align="center" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                <tr>
                  <td style="background:#C9A24D; border-radius:30px;">
                    <a
                      href="${fullLink}"
                      style="
                        display:inline-block;
                        padding:14px 30px;
                        color:#111111;
                        font-size:14px;
                        font-weight:bold;
                        letter-spacing:0.6px;
                        text-decoration:none;
                        font-family:Arial, Helvetica, sans-serif;
                      "
                    >
                      Open in Admin Panel
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <p style="margin:22px 0 0 0; font-size:13px; color:#666; line-height:1.7;">
                Please check the admin dashboard for more details.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding:18px;
                font-size:11px;
                color:#888;
                background:#fafafa;
                font-family:Arial, Helvetica, sans-serif;
              "
            >
              © ${new Date().getFullYear()} UNailedit Admin System. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      });
    } catch (emailErr) {
      console.error(
        `ADMIN GMAIL SEND ERROR for ${admin.email}:`,
        emailErr.message,
      );
    }
  }

  return notifications;
};
