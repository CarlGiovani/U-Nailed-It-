export const bookingSubmittedTemplate = ({
  name = "Customer",
  service = "your service",
  serviceDate = "",
  serviceTime = "",
  cancelLink = "#",
}) => {
  // ----- PHILIPPINES DATE & TIME NORMALIZATION (pure JS) -----
  const formatPhilippineDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-PH", {
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

  // ----- HTML TEMPLATE (same polished design) -----
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Booking Submitted — UNailedit</title>
  <style>
    @media only screen and (max-width: 600px) {
      .responsive-container { width: 100% !important; }
      .inner-padding { padding: 28px 20px !important; }
      .btn { display: block !important; width: 80% !important; margin: 12px auto !important; text-align: center !important; }
      .details-cell { padding: 16px !important; }
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
              <span style="font-size: 14px; letter-spacing: 3px; font-weight: 700; color: #1F1A15; text-transform: uppercase; background: rgba(255,255,240,0.2); padding: 6px 14px; border-radius: 40px; display: inline-block;">📋 BOOKING RECEIVED</span>
              <h1 style="font-size: 32px; font-weight: 800; margin: 18px 0 0 0; color: #1F1A15; letter-spacing: -0.5px;">Request <span style="color: #FFF3E0;">Submitted</span></h1>
            </td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td class="inner-padding" style="padding: 40px 36px 36px 36px;">
              
              <p style="font-size: 18px; font-weight: 500; margin: 0 0 6px 0; color: #2C241A;">Hello, <span style="color:#C17B8C;">${name}</span> 👋</p>
              <p style="font-size: 16px; line-height: 1.5; color: #4A3F32; margin: 6px 0 20px 0;">Your booking request for <strong>${service}</strong> has been <strong style="color:#C9A24D;">successfully submitted</strong> and is now under review.</p>
              
              <div style="width: 60px; height: 3px; background: #E8A1B2; margin: 12px 0 28px 0; border-radius: 4px;"></div>

              <!-- DETAILS CARD with normalized PH date/time -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FFF9F7; border-radius: 24px; border: 1px solid #FFE6E0; margin-bottom: 28px;">
                <tr>
                  <td class="details-cell" style="padding: 22px 24px;">
                    <p style="font-size: 12px; letter-spacing: 1.2px; font-weight: 700; color: #C9A24D; text-transform: uppercase; margin: 0 0 12px 0;">📋 Your booking details</p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr><td width="90" style="padding-bottom: 12px;"><strong style="color:#2C241A;">💆 Service</strong></td><td style="padding-bottom: 12px;">${service}</td></tr>
                      ${normalizedDate ? `<tr><td style="padding-bottom: 12px;"><strong style="color:#2C241A;">📅 Date</strong></td><td style="padding-bottom: 12px;">${normalizedDate}</td></tr>` : ``}
                      ${normalizedTime ? `<tr><td style="padding-bottom: 12px;"><strong style="color:#2C241A;">⏰ Time</strong></td><td style="padding-bottom: 12px;">${normalizedTime} <span style="font-size:13px; color:#A1866B;">(PHT)</span></td></tr>` : ``}
                      <tr><td style="vertical-align: top;"><strong style="color:#2C241A;">🔖 Status</strong></td><td><span style="background:#FFF0E0; color:#C17B45; padding:4px 10px; border-radius:30px; font-size:13px; font-weight:600;">⏳ Pending Approval</span></td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- INFO BOXES -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FEFAF5; border-left: 5px solid #C9A24D; border-radius: 18px; margin: 12px 0 18px;">
                <tr><td style="padding: 18px 22px;"><p style="margin:0 0 6px 0; font-weight:800; color:#C9A24D;">⏳ What happens next?</p><p style="margin:0; font-size:14px;">Please allow some time for us to review your request. You will receive another email once your booking has been <strong>approved</strong> or <strong>declined</strong>.</p></td></tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #FEFAF5; border-left: 5px solid #E8A1B2; border-radius: 18px; margin: 12px 0 28px;">
                <tr><td style="padding: 18px 22px;"><p style="margin:0 0 6px 0; font-weight:800; color:#C17B8C;">✏️ Change of plans?</p><p style="margin:0; font-size:14px;">If your plans change, you may cancel your booking while it is still <strong>pending approval</strong>. Just use the button below.</p></td></tr>
              </table>

              <!-- CANCEL BUTTON -->
              <div style="text-align: center; margin: 8px 0 20px;">
                <a href="${cancelLink}" style="background: #F0E2D0; padding: 14px 28px; border-radius: 50px; text-decoration: none; color: #9B6A4A; font-weight: 700; font-size: 15px; display: inline-block; border: 1px solid #E2CDB5;">🗑️ Cancel My Booking</a>
                <p style="font-size: 12px; color: #AF9A82; margin: 14px auto 0 auto;">Cancel anytime while your request is still pending — no questions asked.</p>
              </div>

              <p style="font-size: 16px; margin: 32px 0 8px 0; color: #2C241A; font-weight: 500;">Thank you for choosing UNailedit — we’ll be in touch soon 💖</p>
              <p style="font-size: 13px; color: #967A62; border-top: 1px solid #F0E4DA; padding-top: 18px; margin-top: 18px;">If the cancel button doesn't work, copy this link:</p>
              <p style="font-size: 12px; word-break: break-all; background: #F9F3ED; padding: 8px 12px; border-radius: 12px; color: #735F4B;">${cancelLink}</p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background: #FEFAF5; padding: 18px 20px; border-top: 1px solid #F1E6DC;">
              <p style="margin:0; font-size:12px; color:#A88E76;">© ${new Date().getFullYear()} UNailedit by Alliyah — Glow with confidence ✨</p>
              <p style="margin:8px 0 0 0; font-size:11px; color:#BCA48C;">We'll notify you once your booking is reviewed.</p>
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