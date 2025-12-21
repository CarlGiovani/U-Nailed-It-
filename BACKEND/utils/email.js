import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();  

const transpoter = nodemailer.createTransport({
   service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


export async function sendMail({ to, subject, html, attachments = [] }) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    attachments
  });
}