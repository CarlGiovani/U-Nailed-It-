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
          <h2>${title}</h2>
          <p>${message}</p>
          ${link ? `<p><a href="${fullLink}">Open in admin panel</a></p>` : ""}
          <hr />
          <small>Type: ${type}</small>
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
