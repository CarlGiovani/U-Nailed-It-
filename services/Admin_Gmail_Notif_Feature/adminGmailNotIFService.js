import { getSingleAdmin } from "../../models/Admin_Gmail_Notif_Feature/adminGmailNotifModel.js";
import supabase from "../../utils/supabaseClient.js";

export const createAdminNotifAndSendGmail = async ({
  type,
  title,
  message,
  link,
  related_entity,
  related_id,
}) => {
  const { data:notification , error: notifError } = await supabase
  .from("notifications")
  .insert({
    type,
    title,
    message,
    link,
    related_entity,
    related_id,
  })
  .select()
  .single();

 if (notifError){
  throw new Error(`Fialed to create notification ${notifError.message}`);
 }

 const adminEmail = await getSingleAdmin();

 if(!adminEmail){
  throw new error("no email admin found");
 }
 
 const frontendUrl = process.env.ADMIN_FRONTEND_URL || 'http//localhost:5174'
  const fullLink = link ? `${frontendUrl}${link}` : frontendUrl;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `[Admin Notification] ${title}`,
    html: `
      <h2>${title}</h2>
      <p>${message}</p>
      ${link ? `<p><a href="${fullLink}">Open in admin panel</a></p>` : ''}
      <hr />
      <small>Type: ${type}</small>
    `
  });
  return notification;

};

