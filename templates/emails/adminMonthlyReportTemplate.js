export const adminMonthlyReportTemplate = ({
  label = "Monthly Report",
  periodStart = "",
  periodEnd = "",
  totalBookings = 0,
  completedBookings = 0,
  cancelledBookings = 0,
  totalRevenue = 0,
  totalCustomers = 0,
  totalReviews = 0,
  topServices = [],
  comparison = null,
}) => {
  // Helper: Format Philippine date for period display
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

  const formattedPeriodStart = formatPhilippineDate(periodStart);
  const formattedPeriodEnd = formatPhilippineDate(periodEnd);

  // Build top services rows
  const serviceRows = topServices.length
    ? topServices
        .map(
          (item, index) => `
          <tr style="border-bottom: 1px solid #F0E4DA;">
            <td style="padding: 14px 12px; color: #3F3325; text-align: center;">${index + 1}</td>
            <td style="padding: 14px 12px; color: #3F3325;">${item.name}</td>
            <td style="padding: 14px 12px; color: #3F3325; text-align: center;">${item.count}</td>
          </tr>
        `
        )
        .join("")
    : `
      <tr>
        <td colspan="3" style="padding: 32px; text-align: center; color: #A1866B;">
          No service data available.
        </td>
      </tr>
    `;

  // Growth badge helper
  const growthBadge = (value) => {
    const sign = value > 0 ? "+" : "";
    const color = value > 0 ? "#1f8f4e" : value < 0 ? "#c0392b" : "#6B4E3A";
    return `<span style="font-weight: 700; color: ${color};">${sign}${Number(value || 0).toFixed(1)}%</span>`;
  };

  // Comparison section (only if comparison data provided)
  const comparisonSection = comparison
    ? `
    <div style="margin: 32px 0 24px;">
      <h3 style="margin: 0 0 16px 0; font-size: 20px; color: #2C241A;">Growth vs ${comparison.previousLabel}</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; background: #FFF9F7; border-radius: 20px; overflow: hidden; border: 1px solid #FFE6E0;">
        <thead>
          <tr style="background: #FEF0EB;">
            <th style="padding: 14px 12px; text-align: left; color: #2C241A; font-weight: 700;">Metric</th>
            <th style="padding: 14px 12px; text-align: center; color: #2C241A; font-weight: 700;">Current</th>
            <th style="padding: 14px 12px; text-align: center; color: #2C241A; font-weight: 700;">Previous</th>
            <th style="padding: 14px 12px; text-align: center; color: #2C241A; font-weight: 700;">Growth</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #F0E4DA;">
            <td style="padding: 12px; color: #4A3F32;">📅 Bookings</td>
            <td style="padding: 12px; text-align: center;">${totalBookings}</td>
            <td style="padding: 12px; text-align: center;">${comparison.previousTotalBookings}</td>
            <td style="padding: 12px; text-align: center;">${growthBadge(comparison.bookingsGrowth)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #F0E4DA;">
            <td style="padding: 12px; color: #4A3F32;">💰 Revenue</td>
            <td style="padding: 12px; text-align: center;">₱${Number(totalRevenue || 0).toLocaleString()}</td>
            <td style="padding: 12px; text-align: center;">₱${Number(comparison.previousTotalRevenue || 0).toLocaleString()}</td>
            <td style="padding: 12px; text-align: center;">${growthBadge(comparison.revenueGrowth)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #F0E4DA;">
            <td style="padding: 12px; color: #4A3F32;">✅ Completed</td>
            <td style="padding: 12px; text-align: center;">${completedBookings}</td>
            <td style="padding: 12px; text-align: center;">${comparison.previousCompletedBookings}</td>
            <td style="padding: 12px; text-align: center;">${growthBadge(comparison.completedGrowth)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #F0E4DA;">
            <td style="padding: 12px; color: #4A3F32;">❌ Cancelled</td>
            <td style="padding: 12px; text-align: center;">${cancelledBookings}</td>
            <td style="padding: 12px; text-align: center;">${comparison.previousCancelledBookings}</td>
            <td style="padding: 12px; text-align: center;">${growthBadge(comparison.cancelledGrowth)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #F0E4DA;">
            <td style="padding: 12px; color: #4A3F32;">👤 New Customers</td>
            <td style="padding: 12px; text-align: center;">${totalCustomers}</td>
            <td style="padding: 12px; text-align: center;">${comparison.previousTotalCustomers}</td>
            <td style="padding: 12px; text-align: center;">${growthBadge(comparison.customersGrowth)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #4A3F32;">⭐ Reviews</td>
            <td style="padding: 12px; text-align: center;">${totalReviews}</td>
            <td style="padding: 12px; text-align: center;">${comparison.previousTotalReviews}</td>
            <td style="padding: 12px; text-align: center;">${growthBadge(comparison.reviewsGrowth)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Monthly Admin Report — UNailedit</title>
  <style>
    @media only screen and (max-width: 600px) {
      .responsive-container { width: 100% !important; }
      .inner-padding { padding: 28px 20px !important; }
      .stats-table td, .stats-table th { display: block; width: 100% !important; text-align: left !important; }
      .stats-table tr { display: block; margin-bottom: 16px; border: 1px solid #FFE6E0; border-radius: 16px; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#F4F1EA; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F1EA; padding:40px 0 50px 0;">
    <tr>
      <td align="center">
        <table width="680" class="responsive-container" cellpadding="0" cellspacing="0" border="0" style="max-width:680px; width:100%; background:#FFFFFF; border-radius:28px; box-shadow:0 20px 35px -10px rgba(0,0,0,0.1); overflow:hidden;">
          
          <!-- HEADER: Gradient same as customer emails -->
          <tr>
            <td style="background: linear-gradient(135deg, #E8A1B2 0%, #C9A24D 100%); padding: 30px 24px; text-align: center;">
              <span style="font-size: 14px; letter-spacing: 3px; font-weight: 700; color: #1F1A15; text-transform: uppercase; background: rgba(255,255,240,0.2); padding: 6px 14px; border-radius: 40px; display: inline-block;">📊 ADMIN REPORT</span>
              <h1 style="font-size: 32px; font-weight: 800; margin: 18px 0 0 0; color: #1F1A15; letter-spacing: -0.5px;">${label}</h1>
              <p style="margin: 12px 0 0 0; font-size: 15px; color: #2C241A; font-weight: 500;">
                Coverage: ${formattedPeriodStart} — ${formattedPeriodEnd}
              </p>
            </td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td class="inner-padding" style="padding: 40px 36px 36px 36px;">
              
              <h2 style="margin: 0 0 8px 0; font-size: 24px; color: #2C241A;">Summary Overview 📊</h2>
              <div style="width: 70px; height: 3px; background: #E8A1B2; margin: 0 0 24px 0; border-radius: 4px;"></div>

              <!-- Key Metrics Grid (simple table with modern styling) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 32px; background: #FFF9F7; border-radius: 20px; overflow: hidden; border: 1px solid #FFE6E0;">
                <tbody>
                  <tr style="border-bottom: 1px solid #F0E4DA;">
                    <td style="padding: 16px 20px; font-weight: 700; color: #2C241A; width: 45%;">Total Bookings</td>
                    <td style="padding: 16px 20px; font-weight: 600; color: #C17B8C;">${totalBookings}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #F0E4DA;">
                    <td style="padding: 16px 20px; font-weight: 700; color: #2C241A;">Completed Bookings</td>
                    <td style="padding: 16px 20px; font-weight: 600; color: #2F6B2F;">${completedBookings}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #F0E4DA;">
                    <td style="padding: 16px 20px; font-weight: 700; color: #2C241A;">Cancelled Bookings</td>
                    <td style="padding: 16px 20px; font-weight: 600; color: #C17B45;">${cancelledBookings}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #F0E4DA;">
                    <td style="padding: 16px 20px; font-weight: 700; color: #2C241A;">Total Revenue</td>
                    <td style="padding: 16px 20px; font-weight: 700; color: #C9A24D; font-size: 18px;">₱${Number(totalRevenue || 0).toLocaleString()}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #F0E4DA;">
                    <td style="padding: 16px 20px; font-weight: 700; color: #2C241A;">New Customers</td>
                    <td style="padding: 16px 20px; font-weight: 600; color: #4A7C59;">${totalCustomers}</td>
                  </tr>
                  <tr>
                    <td style="padding: 16px 20px; font-weight: 700; color: #2C241A;">Reviews Submitted</td>
                    <td style="padding: 16px 20px; font-weight: 600;">${totalReviews}</td>
                  </tr>
                </tbody>
              </table>

              ${comparisonSection}

              <!-- Top Services Section -->
              <h3 style="margin: 32px 0 16px 0; font-size: 20px; color: #2C241A;">🏆 Top Services</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; background: #FFF9F7; border-radius: 20px; overflow: hidden; border: 1px solid #FFE6E0;">
                <thead>
                  <tr style="background: #FEF0EB;">
                    <th style="padding: 14px 12px; text-align: center; width: 15%; color: #2C241A;">#</th>
                    <th style="padding: 14px 12px; text-align: left; color: #2C241A;">Service</th>
                    <th style="padding: 14px 12px; text-align: center; width: 25%; color: #2C241A;">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  ${serviceRows}
                </tbody>
              </table>

              <!-- Footer note -->
              <p style="margin: 32px 0 0 0; font-size: 12px; color: #A1866B; line-height: 1.5; text-align: center;">
                This report was automatically generated by the UNailedit system on ${new Date().toLocaleDateString("en-PH", { timeZone: "Asia/Manila", year: "numeric", month: "long", day: "numeric" })}.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="background: #FEFAF5; padding: 18px 20px; border-top: 1px solid #F1E6DC;">
              <p style="margin: 0; font-size: 12px; color: #A88E76;">© ${new Date().getFullYear()} UNailedit by Alliyah — Admin Analytics Dashboard</p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #BCA48C;">For internal use only</p>
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