export const bookingSubmittedTemplate = ({
  name = "Customer",
  service = "your service",
  serviceDate = "",
  serviceTime = "",
  cancelLink = "#",
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Booking Submitted</title>
</head>

<body style="margin:0; padding:0; background-color:#f2f2f2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2; padding:30px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px; width:100%; border-radius:18px; overflow:hidden; background:#ffffff; box-shadow:0 12px 35px rgba(0,0,0,0.15);"
        >

          <!-- HEADER -->
          <tr>
            <td style="padding:20px; text-align:center; background: linear-gradient(to right, #E8A1B2, #C9A24D);">
              <span style="font-size:13px; letter-spacing:2px; font-weight:bold; color:#111;">
                BOOKING RECEIVED
              </span>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:36px; font-family:Arial; color:#111;">

              <h2 style="margin:0 0 8px 0; font-size:28px;">
                <span style="color:#E8A1B2;">Booking</span>
                <span style="color:#111;">Submitted</span> 💅
              </h2>

              <div style="width:70px; height:4px; background:#C9A24D; border-radius:10px; margin-bottom:18px;"></div>

              <p>Hello <b>${name}</b>,</p>

              <p style="line-height:1.7; color:#333;">
                Your booking request for <b>${service}</b> has been successfully submitted and is currently under review.
              </p>

              <!-- DETAILS -->
              <table width="100%" style="background:#FFF6F8; border-left:4px solid #E8A1B2; border-radius:14px; margin:20px 0; border:1px solid #f1d7dd;">
                <tr>
                  <td style="padding:18px;">
                    <p style="font-size:13px; color:#7a4a57;">BOOKING DETAILS</p>
                    <p><b>Service:</b> ${service}</p>
                    ${serviceDate ? `<p><b>Date:</b> ${serviceDate}</p>` : ``}
                    ${serviceTime ? `<p><b>Time:</b> ${serviceTime} (Local Time)</p>` : ``}
                    <p><b>Status:</b> Pending Approval</p>
                  </td>
                </tr>
              </table>

              <!-- INFO -->
              <table width="100%" style="background:#fafafa; border-left:4px solid #C9A24D; border-radius:12px; margin-bottom:20px;">
                <tr>
                  <td style="padding:16px;">
                    ⏳ Please allow some time for us to review your request.<br><br>
                    You will receive another email once your booking has been approved or declined.
                  </td>
                </tr>
              </table>

              <!-- CANCEL INFO -->
              <table width="100%" style="background:#fafafa; border-left:4px solid #E8A1B2; border-radius:12px; margin-bottom:24px;">
                <tr>
                  <td style="padding:16px;">
                    If your plans change, you may cancel your booking while it is still pending approval.
                  </td>
                </tr>
              </table>

              <!-- BUTTON -->
              <div style="text-align:center;">
                <a href="${cancelLink}" style="background:#C9A24D; padding:14px 30px; border-radius:30px; text-decoration:none; color:#111; font-weight:bold;">
                  Cancel My Booking
                </a>
              </div>

              <p style="font-size:12px; text-align:center; margin-top:20px;">
                If the button does not work, copy and paste this link:
              </p>

              <p style="font-size:12px; text-align:center; word-break:break-all;">
                ${cancelLink}
              </p>

              <p style="color:#444;">
                Thank you for choosing UNailedit — we’ll be in touch soon 💖
              </p>

            </td>
          </tr>

          <tr>
            <td align="center" style="padding:18px; font-size:11px; color:#888;">
              © ${new Date().getFullYear()} UNailedit by Alliyah
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
