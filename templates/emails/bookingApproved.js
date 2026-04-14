export const bookingApprovedTemplate = ({
  name = "Customer",
  service = "your service",
  date = "",
  time = "",
  cancelLink = "#",
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Booking Approved</title>
</head>

<body style="margin:0; padding:0; background:#f2f2f2;">
  <table width="100%" style="padding:30px 0;">
    <tr>
      <td align="center">

        <table width="600" style="max-width:600px; background:#fff; border-radius:18px; box-shadow:0 12px 35px rgba(0,0,0,0.15);">

          <!-- HEADER -->
          <tr>
            <td style="padding:20px; text-align:center; background: linear-gradient(to right, #E8A1B2, #C9A24D);">
              <span style="font-size:13px; letter-spacing:2px; font-weight:bold; color:#111;">
                BOOKING CONFIRMED
              </span>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:36px; font-family:Arial;">

              <h2 style="font-size:28px;">
                <span style="color:#E8A1B2;">Appointment</span>
                <span style="color:#111;">Confirmed</span> 💅
              </h2>

              <div style="width:70px; height:4px; background:#C9A24D; margin-bottom:18px;"></div>

              <p>Hello <b>${name}</b>,</p>

              <p>
                Your booking for <b>${service}</b> has been successfully confirmed.
              </p>

              <!-- DETAILS -->
              <table width="100%" style="background:#FFF6F8; border-left:4px solid #E8A1B2; border-radius:14px; margin:20px 0;">
                <tr>
                  <td style="padding:18px;">
                    <p style="font-size:13px;">BOOKING DETAILS</p>
                    <p><b>Service:</b> ${service}</p>
                    <p><b>Date:</b> ${date}</p>
                    <p><b>Time:</b> ${time} (Local Time)</p>
                    <p><b>Status:</b> Approved</p>
                  </td>
                </tr>
              </table>

              <!-- RULE -->
              <table width="100%" style="background:#fafafa; border-left:4px solid #C9A24D; border-radius:12px;">
                <tr>
                  <td style="padding:16px;">
                    ⏰ You may cancel your booking up to <b>24 hours before your scheduled appointment</b>.<br><br>
                    If your appointment is already within 24 hours, cancellation is no longer allowed.
                  </td>
                </tr>
              </table>

              <p style="margin-top:20px;">
                We look forward to serving you!
              </p>

              <!-- BUTTON -->
              <div style="text-align:center; margin-top:20px;">
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
