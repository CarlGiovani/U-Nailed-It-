import dotenv from "dotenv";
dotenv.config();
export const bookingCompletedTemplate = ({
  name = "Customer",
  service = "your service",
  date = "",
  time = "",
  reviewLink = "#",
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Booking Completed</title>
</head>

<body style="margin:0; padding:0; background-color:#f2f2f2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2; padding:30px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
          style="
            max-width:600px;
            width:100%;
            border-radius:18px;
            overflow:hidden;
            background:#ffffff;
            box-shadow:0 12px 35px rgba(0,0,0,0.15);
          "
        >

          <!-- Gradient Header -->
          <tr>
            <td
              style="
                padding:20px;
                text-align:center;
                background: linear-gradient(to right, #E8A1B2, #C9A24D);
              "
            >
              <span
                style="
                  font-family:Arial, Helvetica, sans-serif;
                  font-size:13px;
                  letter-spacing:2px;
                  font-weight:bold;
                  color:#111111;
                "
              >
                APPOINTMENT COMPLETED
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px; font-family:Arial, Helvetica, sans-serif; color:#111111;">

              <h2 style="margin:0 0 8px 0; font-size:28px;">
                <span style="color:#E8A1B2;">Thank</span>
                <span style="color:#111111;">You</span> 💖
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

              <p style="margin:0 0 12px 0; font-size:15px;">
                Hi <b>${name}</b>,
              </p>

              <p style="margin:0 0 22px 0; font-size:15px; line-height:1.7; color:#333;">
                Your appointment for <b>${service}</b> has been completed.
                We’d love to hear about your experience ✨
              </p>

              <!-- Booking Summary -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="
                  background:#FFF6F8;
                  border-left:4px solid #E8A1B2;
                  border-radius:14px;
                  margin:0 0 22px 0;
                  border:1px solid #f1d7dd;
                "
              >
                <tr>
                  <td style="padding:18px;">
                    <p style="margin:0 0 10px 0; font-size:13px; letter-spacing:1px; color:#7a4a57;">
                      APPOINTMENT DETAILS
                    </p>
                    <p style="margin:6px 0; font-size:14px;"><b>Service:</b> ${service}</p>
                    <p style="margin:6px 0; font-size:14px;"><b>Date:</b> ${date}</p>
                    <p style="margin:6px 0; font-size:14px;"><b>Time:</b> ${time}</p>
                  </td>
                </tr>
              </table>

              <!-- Review Note -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="
                  background:#fafafa;
                  border-left:4px solid #C9A24D;
                  border-radius:12px;
                  margin-bottom:26px;
                  border:1px solid #eee;
                "
              >
                <tr>
                  <td style="padding:16px; font-size:14px;">
                    ⭐ Your feedback helps us improve and grow.
                  </td>
                </tr>
              </table>

              <!-- Review CTA Button -->
              <table align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#E8A1B2; border-radius:30px;">
                    <a
                      href="${reviewLink}"
                      style="
                        display:inline-block;
                        padding:14px 32px;
                        color:#111111;
                        font-size:14px;
                        font-weight:bold;
                        letter-spacing:0.6px;
                        text-decoration:none;
                        font-family:Arial, Helvetica, sans-serif;
                      "
                    >
                      Leave a Review
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:22px 0 0 0; font-size:12px; color:#666;">
                This review link can only be used once.<br />
                <span style="word-break:break-all;">${reviewLink}</span>
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
              © ${new Date().getFullYear()} UNailedit by Alliyah. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
