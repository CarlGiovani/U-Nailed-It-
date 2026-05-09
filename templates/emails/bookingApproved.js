export const bookingApprovedTemplate = ({
  name = "Customer",
  service = "your service",
  date = "",
  time = "",
  cancelLink = "#",
  studioAddress = "H338+Q9V, 118 San Guillermo Ave, Pasig, 1600 Metro Manila",
  supportEmail = "unaileditbyalliyah@gmail.com",
}) => {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    studioAddress,
  )}`;

  const mailTo = `mailto:${supportEmail}?subject=Booking Inquiry&body=Hello! I have a question about my booking.`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Booking Confirmed — UNailedit</title>
  <style>
    @media only screen and (max-width: 600px) {
      .responsive-container {
        width: 100% !important;
      }
      .inner-padding {
        padding: 24px 20px !important;
      }
      .btn-group {
        text-align: center !important;
      }
      .btn {
        display: block !important;
        width: 80% !important;
        margin: 10px auto !important;
        text-align: center !important;
      }
      .details-cell {
        padding: 16px !important;
      }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#F4F1EA; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">

  <!-- MAIN WRAPPER (GRAY BACKGROUND) -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F1EA; padding:40px 0 50px 0;">
    <tr>
      <td align="center">

        <!-- MAIN CARD (600px max) -->
        <table width="600" class="responsive-container" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#FFFFFF; border-radius:28px; box-shadow:0 20px 35px -10px rgba(0,0,0,0.1); overflow:hidden;">
          
          <!-- HEADER SECTION (Gradient + subtle shine) -->
          <tr>
            <td style="background: linear-gradient(135deg, #E8A1B2 0%, #C9A24D 100%); padding: 30px 24px; text-align: center;">
              <span style="font-size: 14px; letter-spacing: 3px; font-weight: 700; color: #1F1A15; text-transform: uppercase; background: rgba(255,255,240,0.2); padding: 6px 14px; border-radius: 40px; display: inline-block;">✨ BOOKING CONFIRMED ✨</span>
              <h1 style="font-size: 32px; font-weight: 800; margin: 18px 0 0 0; color: #1F1A15; letter-spacing: -0.5px;">Appointment <span style="color: #FFF3E0;">Ready</span></h1>
            </td>
          </tr>

          <!-- MAIN CONTENT AREA (improved padding & spacing) -->
          <tr>
            <td class="inner-padding" style="padding: 40px 36px 36px 36px;">
              
              <!-- Greeting -->
              <p style="font-size: 18px; font-weight: 500; margin: 0 0 6px 0; color: #2C241A;">Hello, <span style="color:#C17B8C;">${name}</span> 👋</p>
              <p style="font-size: 16px; line-height: 1.5; color: #4A3F32; margin: 6px 0 20px 0;">Great news! Your booking for <strong>${service}</strong> has been <strong style="color:#C9A24D;">approved & confirmed</strong>. We can't wait to welcome you.</p>
              
              <!-- Divider (elegant) -->
              <div style="width: 60px; height: 3px; background: #E8A1B2; margin: 12px 0 28px 0; border-radius: 4px;"></div>

              <!-- BOOKING DETAILS CARD (enhanced) -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FFF9F7; border-radius: 24px; border: 1px solid #FFE6E0; margin-bottom: 28px;">
                <tr>
                  <td class="details-cell" style="padding: 22px 24px;">
                    <p style="font-size: 12px; letter-spacing: 1.2px; font-weight: 700; color: #C9A24D; text-transform: uppercase; margin: 0 0 12px 0;">📋 Your appointment details</p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="90" style="padding-bottom: 12px; vertical-align: top;"><strong style="color:#2C241A;">💆 Service</strong></td>
                        <td style="padding-bottom: 12px; color: #3F3325;">${service}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; vertical-align: top;"><strong style="color:#2C241A;">📅 Date</strong></td>
                        <td style="padding-bottom: 12px; color: #3F3325;">${date || "TBD — check your booking portal"}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; vertical-align: top;"><strong style="color:#2C241A;">⏰ Time</strong></td>
                        <td style="padding-bottom: 12px; color: #3F3325;">${time || "To be arranged"} <span style="font-size: 13px; color:#A1866B;">(local time)</span></td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 8px; vertical-align: top;"><strong style="color:#2C241A;">📍 Studio</strong></td>
                        <td style="padding-bottom: 8px; color: #3F3325; line-height: 1.4;">${studioAddress}</td>
                      </tr>
                      <tr>
                        <td style="vertical-align: top;"><strong style="color:#2C241A;">🔖 Status</strong></td>
                        <td><span style="background:#E8F0E7; color:#2F6B2F; padding: 4px 10px; border-radius: 30px; font-size: 13px; font-weight: 600;">✓ Approved</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ACTION BUTTON GROUP (Map + Contact) with better spacing -->
              <div style="text-align: center; margin: 20px 0 28px 0;">
                <a href="${mapsUrl}" style="display: inline-block; background: #E8A1B2; padding: 14px 28px; border-radius: 50px; text-decoration: none; color: #1F1A15; font-weight: 700; font-size: 15px; margin: 0 6px 12px 6px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); transition: 0.2s;">📍 Get Directions</a>
                <a href="${mailTo}" style="display: inline-block; background: #C9A24D; padding: 14px 28px; border-radius: 50px; text-decoration: none; color: #1F1A15; font-weight: 700; font-size: 15px; margin: 0 6px 12px 6px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); transition: 0.2s;">✉️ Contact Support</a>
              </div>

              <!-- CANCELLATION POLICY (clear & helpful) -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FEFAF5; border-left: 5px solid #E8A1B2; border-radius: 18px; margin: 12px 0 18px;">
                <tr>
                  <td style="padding: 18px 22px;">
                    <p style="margin: 0 0 6px 0; font-weight: 800; color: #C17B8C;">📌 Cancellation policy</p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.45; color: #4A3F32;">⏰ You may cancel your booking up to <strong>24 hours before your scheduled appointment</strong>. If your appointment is already within 24 hours, cancellation is no longer allowed.</p>
                  </td>
                </tr>
              青少年

              <!-- CANCEL BUTTON (standalone, easy to find) -->
              <div style="text-align: center; margin: 8px 0 20px;">
                <a href="${cancelLink}" style="background: #F0E2D0; padding: 14px 28px; border-radius: 50px; text-decoration: none; color: #9B6A4A; font-weight: 700; font-size: 15px; display: inline-block; border: 1px solid #E2CDB5;">🗑️ Cancel My Booking</a>
                <p style="font-size: 12px; color: #AF9A82; margin: 12px auto 0 auto; max-width: 85%;">If you need to cancel, please use the button above before the 24h deadline.</p>
              </div>

              <!-- THANK YOU NOTE + small link backup -->
              <p style="font-size: 16px; margin: 32px 0 8px 0; color: #2C241A; font-weight: 500;">We look forward to serving you! 💅</p>
              <p style="font-size: 13px; color: #967A62; border-top: 1px solid #F0E4DA; padding-top: 18px; margin-top: 18px;">If the cancel button doesn't work, copy this link into your browser:</p>
              <p style="font-size: 12px; word-break: break-all; background: #F9F3ED; padding: 8px 12px; border-radius: 12px; color: #735F4B;">${cancelLink}</p>

            </td>
          </tr>

          <!-- FOOTER (Streamlined) -->
          <tr>
            <td align="center" style="background: #FEFAF5; padding: 18px 20px; border-top: 1px solid #F1E6DC;">
              <p style="margin: 0; font-size: 12px; color: #A88E76;">© ${new Date().getFullYear()} UNailedit by Alliyah — Glow with confidence ✨</p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #BCA48C;">Need changes? Reply to this email or reach us at ${supportEmail}</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
};
