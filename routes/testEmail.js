import express from "express";
import transporter from "../utils/emailTransporter.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: "your-other-email@gmail.com",
      subject: "SMTP TEST",
      text: "Gumagana na 🎉",
    });

    res.json({ message: "email sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
