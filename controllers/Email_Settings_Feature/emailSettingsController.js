import { getCurrentEmailSettings, getCurrentEmailSettingsWithPassword,updateEmailSettingsRecord } from "../../services/Email_Feature/emailSettingsService.js";
import createEmailTransporter from "../../utils/createEmailTransporter.js";

export const getEmailSettings = async (req, res) => {
  try {
    const settings = await getCurrentEmailSettings();

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateEmailSettings = async (req, res) => {
  try {
    const { sender_name, email_user, email_app_password } = req.body;

    if (!sender_name || !email_user) {
      return res.status(400).json({
        success: false,
        message: "Sender name and email user are required.",
      });
    }

    const updated = await updateEmailSettingsRecord({
      sender_name: sender_name.trim(),
      email_user: email_user.trim(),
      email_app_password: email_app_password?.trim() || "",
    });

    return res.status(200).json({
      success: true,
      message: "Email settings updated successfully.",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const testEmailSettings = async (req, res) => {
  try {
    const { sender_name, email_user, email_app_password, test_to } = req.body;

    if (!sender_name || !email_user || !test_to) {
      return res.status(400).json({
        success: false,
        message: "Sender name, email user, and test recipient are required.",
      });
    }

    let passwordToUse = email_app_password?.trim();

    if (!passwordToUse) {
      const existing = await getCurrentEmailSettingsWithPassword();

      if (!existing?.email_app_password) {
        return res.status(400).json({
          success: false,
          message: "No email app password found for testing.",
        });
      }

      passwordToUse = existing.email_app_password;
    }

    const transporter = createEmailTransporter({
      email_user: email_user.trim(),
      email_app_password: passwordToUse,
    });

    await transporter.sendMail({
      from: `"${sender_name.trim()}" <${email_user.trim()}>`,
      to: test_to.trim(),
      subject: "UNailed It Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Email Sender Test Successful</h2>
          <p>This is a test email from your UNailed It admin settings.</p>
          <p><strong>Sender Name:</strong> ${sender_name.trim()}</p>
          <p><strong>Sender Email:</strong> ${email_user.trim()}</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to send test email: ${error.message}`,
    });
  }
};
