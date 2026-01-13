import transporter from "../../utils/emailTransporter.js";

 const sendEmail = async ({to , subject, html}) => {
  await transporter.sendEmail({
    from: `"UNailed It <${process.env.EMAIL_USER}>"`,
    to,
    subject,  
    html,
  });
}

export default sendEmail;