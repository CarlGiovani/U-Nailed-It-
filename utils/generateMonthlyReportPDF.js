import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const safePercent = (value) => {
  const num = Number(value || 0);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(1)}%`;
};

const growthColor = (value) => {
  const num = Number(value || 0);
  if (num > 0) return "#1f8f4e";
  if (num < 0) return "#c0392b";
  return "#555555";
};

const drawMetricCard = (
  doc,
  x,
  y,
  width,
  height,
  title,
  current,
  previous,
  growth,
) => {
  doc.roundedRect(x, y, width, height, 10).fillAndStroke("#fafafa", "#dddddd");

  doc
    .fillColor("#111111")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(title, x + 12, y + 12);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#555555")
    .text(`Current: ${current}`, x + 12, y + 34);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#555555")
    .text(`Previous: ${previous}`, x + 12, y + 50);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(growthColor(growth))
    .text(`Growth: ${safePercent(growth)}`, x + 12, y + 68);
};

const drawSimpleComparisonChart = (
  doc,
  {
    title,
    currentLabel,
    previousLabel,
    currentValue,
    previousValue,
    x,
    y,
    width,
    height,
    valueFormatter = (v) => String(v),
  },
) => {
  const maxValue = Math.max(
    Number(currentValue || 0),
    Number(previousValue || 0),
    1,
  );
  const chartTop = y + 24;
  const barBottom = y + height - 28;
  const barAreaHeight = barBottom - chartTop;
  const barWidth = 54;
  const gap = 42;
  const firstBarX = x + 34;
  const secondBarX = firstBarX + barWidth + gap;

  doc.roundedRect(x, y, width, height, 10).fillAndStroke("#ffffff", "#dddddd");

  doc
    .fillColor("#111111")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(title, x + 12, y + 8);

  const prevHeight = (Number(previousValue || 0) / maxValue) * barAreaHeight;
  const currHeight = (Number(currentValue || 0) / maxValue) * barAreaHeight;

  doc
    .strokeColor("#cccccc")
    .moveTo(x + 20, barBottom)
    .lineTo(x + width - 20, barBottom)
    .stroke();

  // Previous bar
  doc
    .fillColor("#e8a1b2")
    .rect(firstBarX, barBottom - prevHeight, barWidth, prevHeight)
    .fill();

  // Current bar
  doc
    .fillColor("#c9a24d")
    .rect(secondBarX, barBottom - currHeight, barWidth, currHeight)
    .fill();

  doc.fillColor("#555555").font("Helvetica").fontSize(9);
  doc.text(previousLabel, firstBarX - 8, barBottom + 6, {
    width: 72,
    align: "center",
  });
  doc.text(currentLabel, secondBarX - 8, barBottom + 6, {
    width: 72,
    align: "center",
  });

  doc.fillColor("#111111").font("Helvetica-Bold").fontSize(9);
  doc.text(
    valueFormatter(previousValue),
    firstBarX - 8,
    barBottom - prevHeight - 16,
    { width: 72, align: "center" },
  );
  doc.text(
    valueFormatter(currentValue),
    secondBarX - 8,
    barBottom - currHeight - 16,
    { width: 72, align: "center" },
  );
};

export const generateMonthlyReportPdf = ({
  label,
  periodStart,
  periodEnd,
  totalBookings,
  completedBookings,
  cancelledBookings,
  totalRevenue,
  totalCustomers,
  totalReviews,
  topServices = [],
  comparison = null,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `monthly-report-${label.replace(/\s+/g, "-")}.pdf`;
      const tmpDir = path.join(process.cwd(), "tmp");
      const filePath = path.join(tmpDir, fileName);

      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.roundedRect(40, 40, 515, 70, 14).fillAndStroke("#fff6f8", "#e7d7db");

      doc
        .fillColor("#111111")
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("UNAILEDIT Monthly Report", 60, 58);
      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("#555555")
        .text(`${label} • ${periodStart} to ${periodEnd}`, 60, 86);

      let y = 132;

      // Summary section
      doc
        .fillColor("#111111")
        .font("Helvetica-Bold")
        .fontSize(15)
        .text("Summary Overview", 40, y);
      y += 24;

      const summaryRows = [
        ["Total Bookings", totalBookings],
        ["Completed Bookings", completedBookings],
        ["Cancelled Bookings", cancelledBookings],
        ["Total Revenue", `PHP ${Number(totalRevenue || 0).toLocaleString()}`],
        ["New Customers", totalCustomers],
        ["Reviews Submitted", totalReviews],
      ];

      summaryRows.forEach(([labelText, value]) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor("#222222")
          .text(labelText, 50, y, { width: 180 });
        doc
          .font("Helvetica")
          .fontSize(11)
          .fillColor("#555555")
          .text(String(value), 240, y, { width: 220 });
        y += 20;
      });

      y += 12;

      // Comparison section
      if (comparison) {
        doc
          .fillColor("#111111")
          .font("Helvetica-Bold")
          .fontSize(15)
          .text(`Growth vs ${comparison.previousLabel}`, 40, y);
        y += 24;

        const cardWidth = 240;
        const cardHeight = 96;
        const gap = 16;

        drawMetricCard(
          doc,
          40,
          y,
          cardWidth,
          cardHeight,
          "Bookings",
          totalBookings,
          comparison.previousTotalBookings,
          comparison.bookingsGrowth,
        );

        drawMetricCard(
          doc,
          40 + cardWidth + gap,
          y,
          cardWidth,
          cardHeight,
          "Revenue",
          `PHP ${Number(totalRevenue || 0).toLocaleString()}`,
          `PHP ${Number(comparison.previousTotalRevenue || 0).toLocaleString()}`,
          comparison.revenueGrowth,
        );

        y += cardHeight + 18;

        drawMetricCard(
          doc,
          40,
          y,
          cardWidth,
          cardHeight,
          "Completed",
          completedBookings,
          comparison.previousCompletedBookings,
          comparison.completedGrowth,
        );

        drawMetricCard(
          doc,
          40 + cardWidth + gap,
          y,
          cardWidth,
          cardHeight,
          "Cancelled",
          cancelledBookings,
          comparison.previousCancelledBookings,
          comparison.cancelledGrowth,
        );

        y += cardHeight + 24;

        if (y > 640) {
          doc.addPage();
          y = 40;
        }

        doc
          .fillColor("#111111")
          .font("Helvetica-Bold")
          .fontSize(15)
          .text("Comparison Charts", 40, y);
        y += 24;

        drawSimpleComparisonChart(doc, {
          title: "Bookings",
          previousLabel: comparison.previousLabel,
          currentLabel: label,
          previousValue: comparison.previousTotalBookings,
          currentValue: totalBookings,
          x: 40,
          y,
          width: 250,
          height: 190,
        });

        drawSimpleComparisonChart(doc, {
          title: "Revenue",
          previousLabel: comparison.previousLabel,
          currentLabel: label,
          previousValue: comparison.previousTotalRevenue,
          currentValue: totalRevenue,
          x: 305,
          y,
          width: 250,
          height: 190,
          valueFormatter: (v) => `PHP ${Number(v || 0).toLocaleString()}`,
        });

        y += 214;
      }

      // Top services
      if (y > 650) {
        doc.addPage();
        y = 40;
      }

      doc
        .fillColor("#111111")
        .font("Helvetica-Bold")
        .fontSize(15)
        .text("Top Services", 40, y);
      y += 26;

      if (!topServices.length) {
        doc
          .font("Helvetica")
          .fontSize(11)
          .fillColor("#555555")
          .text("No top services data available.", 50, y);
      } else {
        topServices.forEach((service, index) => {
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#222222")
            .text(`${index + 1}. ${service.name}`, 50, y, {
              width: 340,
            });
          doc
            .font("Helvetica")
            .fontSize(11)
            .fillColor("#555555")
            .text(`${service.count} bookings`, 420, y, {
              width: 100,
              align: "right",
            });
          y += 22;
        });
      }

      // Footer
      const addFooter = () => {
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i += 1) {
          doc.switchToPage(i);
          doc
            .font("Helvetica")
            .fontSize(9)
            .fillColor("#888888")
            .text(
              `Generated by UNAILEDIT • ${new Date().toLocaleString()}`,
              40,
              800,
              { align: "center", width: 515 },
            );
        }
      };

      doc.on("pageAdded", () => {});

      doc.end();

      stream.on("finish", () => {
        addFooter();
        resolve({
          fileName,
          filePath,
        });
      });

      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};
