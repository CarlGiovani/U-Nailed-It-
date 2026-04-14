export const bookingRejectedTemplate = ({
  name = "Customer",
  service = "your service",
  serviceDate = "",
  serviceTime = "",
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Booking Rejected</title>
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

          <!-- HEADER -->
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
                BOOKING UPDATE
              </span>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:36px; font-family:Arial, Helvetica, sans-serif; color:#111111;">

              <!-- HEADLINE -->
              <h2 style="margin:0 0 8px 0; font-size:28px;">
                <span style="color:#E8A1B2;">Booking</span>
                <span style="color:#111111;">Not Available</span> 💔
              </h2>

              <!-- UNDERLINE -->
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
                Hello <b>${name}</b>,
              </p>

              <p style="margin:0 0 22px 0; font-size:15px; line-height:1.7; color:#333;">
                Thank you for your interest in <b>${service}</b>.<br><br>
                Unfortunately, we’re unable to accommodate your booking for the selected schedule at this time.
              </p>

              <!-- DETAILS -->
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
                      BOOKING DETAILS
                    </p>
                    <p style="margin:6px 0; font-size:14px;"><b>Service:</b> ${service}</p>
                    ${serviceDate ? `<p style="margin:6px 0; font-size:14px;"><b>Date:</b> ${serviceDate}</p>` : ``}
                    ${serviceTime ? `<p style="margin:6px 0; font-size:14px;"><b>Time:</b> ${serviceTime} (Local Time)</p>` : ``}
                    <p style="margin:6px 0; font-size:14px;"><b>Status:</b> Rejected</p>
                  </td>
                </tr>
              </table>

              <!-- REASSURANCE -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="
                  background:#fafafa;
                  border-left:4px solid #C9A24D;
                  border-radius:12px;
                  margin-bottom:22px;
                  border:1px solid #eee;
                "
              >
                <tr>
                  <td style="padding:16px; font-size:14px; line-height:1.8; color:#333;">
                    ✨ You’re welcome to choose another available date or service that fits your schedule.
                  </td>
                </tr>
              </table>

              <!-- CLOSING -->
              <p style="margin:0 0 22px 0; font-size:14px; line-height:1.7; color:#444;">
                We truly appreciate your understanding and hope to serve you soon.
              </p>

              <p style="margin:0; font-size:14px; color:#444;">
                Thank you for choosing UNailedit 💖
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
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
