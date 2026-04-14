export const customerBlockedTemplate = ({
  name = "Customer",
  email = "",
  reason = "Policy violation",
  cancelCount = 0,
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Account Restricted</title>
</head>

<body style="margin:0; padding:0; background-color:#f2f2f2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr>
      <td align="center">

        <table width="600" style="background:#fff; border-radius:18px; overflow:hidden; box-shadow:0 12px 35px rgba(0,0,0,0.15);">

          <!-- HEADER -->
          <tr>
            <td style="padding:20px; text-align:center; background:linear-gradient(to right, #E8A1B2, #C9A24D);">
              <span style="font-size:13px; font-weight:bold; letter-spacing:2px;">
                ACCOUNT NOTICE
              </span>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:36px; font-family:Arial; color:#111;">

              <h2 style="margin-bottom:10px;">
                <span style="color:#E8A1B2;">Account</span>
                <span> Restricted 🚫</span>
              </h2>

              <div style="width:70px; height:4px; background:#C9A24D; border-radius:10px; margin-bottom:20px;"></div>

              <p>Hello <b>${email}</b>,</p>

              <p style="line-height:1.7; color:#333;">
                We regret to inform you that your account has been <b>restricted</b> from making new bookings due to repeated cancellations.
              </p>

              <!-- DETAILS BOX -->
              <table width="100%" style="background:#FFF6F8; border-left:4px solid #E8A1B2; border-radius:12px; margin:20px 0;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0; font-size:13px; color:#7a4a57;">ACCOUNT DETAILS</p>
                    <p style="margin:6px 0;"><b>Email:</b> ${email || "N/A"}</p>
                    ${
                      cancelCount > 0
                        ? `<p style="margin:6px 0;"><b>Cancelled Bookings:</b> ${cancelCount}</p>`
                        : ``
                    }
                    <p style="margin:6px 0;"><b>Status:</b> Restricted</p>
                  </td>
                </tr>
              </table>

              <!-- REASON BOX -->
              <table width="100%" style="background:#fafafa; border-left:4px solid #C9A24D; border-radius:12px; margin-bottom:20px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0; font-size:13px; color:#777;">REASON</p>
                    <p style="margin:8px 0 0;"><b>${reason}</b></p>
                  </td>
                </tr>
              </table>

              <p style="line-height:1.7; color:#444;">
                If you believe this action was made in error, you may contact our support team for review.
              </p>

              <p style="margin-top:20px;">Thank you for understanding.</p>
              <p>UNailedit Team 💖</p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="text-align:center; padding:16px; font-size:11px; color:#888;">
              © ${new Date().getFullYear()} UNailedit
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
