export const bookingRejectedTemplate = ({
  name = "Customer",
  service = "your service",
  serviceDate = "",
  serviceTime = "",
}) => {
  // ----- PHILIPPINES DATE & TIME NORMALIZATION -----
  const formatPhilippineDate = (dateString) => {
    if (!dateString) return "";
    try {
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) return dateString;
      return parsedDate.toLocaleDateString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatPhilippineTime = (timeString) => {
    if (!timeString) return "";
    try {
      let date;
      if (timeString.includes("T") || timeString.includes(":")) {
        date = new Date(`2000-01-01T${timeString}`);
        if (isNaN(date.getTime())) date = new Date(timeString);
      } else {
        date = new Date(`2000-01-01T${timeString}`);
      }
      if (isNaN(date.getTime())) return timeString;
      return date.toLocaleTimeString("en-PH", {
        timeZone: "Asia/Manila",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const normalizedDate = formatPhilippineDate(serviceDate);
  const normalizedTime = formatPhilippineTime(serviceTime);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Booking Update — UNailedit</title>
  <style>
    @media only screen and (max-width: 600px) {
      .responsive-container {
        width: 100% !important;
      }
      .inner-padding {
        padding: 28px 20px !important;
      }
      .details-cell {
        padding: 16px !important;
      }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#F4F1EA; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F1EA; padding:40px 0 50px 0;">
    <tr>
      <td align="center">

        <table width="600" class="responsive-container" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#FFFFFF; border-radius:28px; box-shadow:0 20px 35px -10px rgba(0,0,0,0.1); overflow:hidden;">
          
          <!-- HEADER gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #E8A1B2 0%, #C9A24D 100%); padding: 30px 24px; text-align: center;">
              <span style="font-size: 14px; letter-spacing: 3px; font-weight: 700; color: #1F1A15; text-transform: uppercase; background: rgba(255,255,240,0.2); padding: 6px 14px; border-radius: 40px; display: inline-block;">📢 BOOKING UPDATE</span>
              <h1 style="font-size: 32px; font-weight: 800; margin: 18px 0 0 0; color: #1F1A15; letter-spacing: -0.5px;">Booking <span style="color: #FFF3E0;">Not Available</span> 💔</h1>
            </td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td class="inner-padding" style="padding: 40px 36px 36px 36px;">
              
              <!-- Greeting -->
              <p style="font-size: 18px; font-weight: 500; margin: 0 0 6px 0; color: #2C241A;">Hello, <span style="color:#C17B8C;">${name}</span> 👋</p>
              <p style="font-size: 16px; line-height: 1.5; color: #4A3F32; margin: 6px 0 20px 0;">Thank you for your interest in <strong>${service}</strong>. Unfortunately, we’re unable to accommodate your booking for the selected schedule at this time.</p>
              
              <div style="width: 60px; height: 3px; background: #E8A1B2; margin: 12px 0 28px 0; border-radius: 4px;"></div>

              <!-- DETAILS CARD -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FFF9F7; border-radius: 24px; border: 1px solid #FFE6E0; margin-bottom: 28px;">
                <tr>
                  <td class="details-cell" style="padding: 22px 24px;">
                    <p style="font-size: 12px; letter-spacing: 1.2px; font-weight: 700; color: #C9A24D; text-transform: uppercase; margin: 0 0 12px 0;">📋 Your booking details</p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="90" style="padding-bottom: 12px; vertical-align: top;"><strong style="color:#2C241A;">💆 Service</strong></td>
                        <td style="padding-bottom: 12px; color: #3F3325;">${service}</td>
                      </tr>
                      ${normalizedDate ? `
                      <tr>
                        <td style="padding-bottom: 12px; vertical-align: top;"><strong style="color:#2C241A;">📅 Date</strong></td>
                        <td style="padding-bottom: 12px; color: #3F3325;">${normalizedDate}</td>
                      </tr>
                      ` : ``}
                      ${normalizedTime ? `
                      <tr>
                        <td style="padding-bottom: 12px; vertical-align: top;"><strong style="color:#2C241A;">⏰ Time</strong></td>
                        <td style="padding-bottom: 12px; color: #3F3325;">${normalizedTime} <span style="font-size:13px; color:#A1866B;">(PHT)</span></td>
                      </tr>
                      ` : ``}
                      <tr>
                        <td style="vertical-align: top;"><strong style="color:#2C241A;">🔖 Status</strong></td>
                        <td><span style="background:#FFF0E0; color:#C17B45; padding:4px 10px; border-radius:30px; font-size:13px; font-weight:600;">❌ Rejected</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- REASSURANCE BOX -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FEFAF5; border-left: 5px solid #E8A1B2; border-radius: 18px; margin: 12px 0 18px;">
                <tr>
                  <td style="padding: 18px 22px;">
                    <p style="margin: 0 0 6px 0; font-weight: 800; color: #C17B8C;">✨ What can you do next?</p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.45; color: #4A3F32;">You’re welcome to choose another available date or service that fits your schedule. We’d love to have you at UNailedit.</p>
                  </td>
                </tr>
              </table>

              <!-- CLOSING NOTE -->
              <p style="font-size: 16px; margin: 32px 0 8px 0; color: #2C241A; font-weight: 500;">We truly appreciate your understanding and hope to serve you soon. 💖</p>
              <p style="font-size: 14px; color: #967A62; margin-top: 8px;">Thank you for choosing UNailedit — we look forward to welcoming you another time.</p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background: #FEFAF5; padding: 18px 20px; border-top: 1px solid #F1E6DC;">
              <p style="margin: 0; font-size: 12px; color: #A88E76;">© ${new Date().getFullYear()} UNailedit by Alliyah — Glow with confidence ✨</p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #BCA48C;">We hope to see you soon!</p>
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