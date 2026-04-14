import nodemailer from "nodemailer";

const createEmailTransporter = ({ email_user, email_app_password }) => {
  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: email_user,
      pass: email_app_password,
    },
  });
};

export default createEmailTransporter;
