import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// delivery service configuration 
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({to , subject, html, attachments}) {

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    attachments,
  };


  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent Successfully");
  } catch (err) {
    console.error("Error sending email:", err);
  }



}
