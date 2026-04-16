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
  openLink = "",
}) => {
  const serviceRows = topServices.length
    ? topServices
        .map(
          (item, index) => `
            <tr>
              <td style="padding:10px;border:1px solid #eee;">${index + 1}</td>
              <td style="padding:10px;border:1px solid #eee;">${item.name}</td>
              <td style="padding:10px;border:1px solid #eee;">${item.count}</td>
            </tr>
          `,
        )
        .join("")
    : `
      <tr>
        <td colspan="3" style="padding:12px;border:1px solid #eee;text-align:center;">
          No service data available.
        </td>
      </tr>
    `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Monthly Report</title>
</head>
<body style="margin:0; padding:0; background-color:#f2f2f2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2; padding:30px 0;">
    <tr>
      <td align="center">
        <table
          width="680"
          cellpadding="0"
          cellspacing="0"
          style="
            max-width:680px;
            width:100%;
            border-radius:18px;
            overflow:hidden;
            background:#ffffff;
            box-shadow:0 12px 35px rgba(0,0,0,0.15);
          "
        >
          <tr>
            <td
              style="
                padding:24px;
                text-align:center;
                background: linear-gradient(to right, #E8A1B2, #C9A24D);
                font-family:Arial, Helvetica, sans-serif;
              "
            >
              <span
                style="
                  font-size:13px;
                  letter-spacing:2px;
                  font-weight:bold;
                  color:#111111;
                "
              >
                MONTHLY ADMIN REPORT
              </span>

              <h1 style="margin:12px 0 0 0; font-size:28px; color:#111111;">
                ${label}
              </h1>

              <p style="margin:10px 0 0 0; font-size:14px; color:#222;">
                Coverage: ${periodStart} to ${periodEnd}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:34px; font-family:Arial, Helvetica, sans-serif; color:#111111;">
              <h2 style="margin:0 0 8px 0; font-size:24px;">
                Summary Overview 📊
              </h2>

              <div
                style="
                  width:72px;
                  height:4px;
                  background:#C9A24D;
                  border-radius:999px;
                  margin:0 0 20px 0;
                "
              ></div>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  border-collapse:collapse;
                  margin:0 0 26px 0;
                  border:1px solid #eee;
                  border-radius:14px;
                  overflow:hidden;
                "
              >
                <tr>
                  <td style="padding:12px; border:1px solid #eee; font-weight:bold;">Total Bookings</td>
                  <td style="padding:12px; border:1px solid #eee;">${totalBookings}</td>
                </tr>
                <tr>
                  <td style="padding:12px; border:1px solid #eee; font-weight:bold;">Completed Bookings</td>
                  <td style="padding:12px; border:1px solid #eee;">${completedBookings}</td>
                </tr>
                <tr>
                  <td style="padding:12px; border:1px solid #eee; font-weight:bold;">Cancelled Bookings</td>
                  <td style="padding:12px; border:1px solid #eee;">${cancelledBookings}</td>
                </tr>
                <tr>
                  <td style="padding:12px; border:1px solid #eee; font-weight:bold;">Total Revenue</td>
                  <td style="padding:12px; border:1px solid #eee;">PHP ${Number(totalRevenue || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding:12px; border:1px solid #eee; font-weight:bold;">New Customers</td>
                  <td style="padding:12px; border:1px solid #eee;">${totalCustomers}</td>
                </tr>
                <tr>
                  <td style="padding:12px; border:1px solid #eee; font-weight:bold;">Reviews Submitted</td>
                  <td style="padding:12px; border:1px solid #eee;">${totalReviews}</td>
                </tr>
              </table>

              <h3 style="margin:0 0 14px 0; font-size:20px;">Top Services</h3>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  border-collapse:collapse;
                  margin:0 0 26px 0;
                  border:1px solid #eee;
                "
              >
                <thead>
                  <tr>
                    <th style="padding:10px; border:1px solid #eee; background:#fff6f8;">#</th>
                    <th style="padding:10px; border:1px solid #eee; background:#fff6f8;">Service</th>
                    <th style="padding:10px; border:1px solid #eee; background:#fff6f8;">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  ${serviceRows}
                </tbody>
              </table>

              ${
                openLink
                  ? `
              <table align="center" cellpadding="0" cellspacing="0" style="margin-top:14px;">
                <tr>
                  <td style="background:#C9A24D; border-radius:30px;">
                    <a
                      href="${openLink}"
                      style="
                        display:inline-block;
                        padding:14px 28px;
                        color:#111111;
                        font-size:14px;
                        font-weight:bold;
                        letter-spacing:0.4px;
                        text-decoration:none;
                        font-family:Arial, Helvetica, sans-serif;
                      "
                    >
                      Open Admin Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <p style="margin:24px 0 0 0; font-size:13px; color:#666; line-height:1.7;">
                This report was automatically generated by the UNAILEDIT system.
              </p>
            </td>
          </tr>

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
              © ${new Date().getFullYear()} UNAILEDIT Admin System. All rights reserved.
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
