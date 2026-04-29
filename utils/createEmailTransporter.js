import nodemailer from "nodemailer";

const createEmailTransporter = ({ email_user, email_app_password }) => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: email_user,
      pass: email_app_password,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

export default createEmailTransporter;