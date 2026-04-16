import {
  generateMonthlyReport,
  getMonthlyReports,
} from "../../services/Reports_Feature/monthlyReportService.js";

let isMonthlyReportRunning = false;

export const runMonthlyReportJob = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET_MONTHLY_REPORT}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (isMonthlyReportRunning) {
      return res.status(200).json({
        success: true,
        message: "Skipped: previous monthly report job is still running.",
      });
    }

    isMonthlyReportRunning = true;

    console.log("[CRON] Monthly report job started...");

    const result = await generateMonthlyReport();

    console.log("[CRON] Monthly report job done", result);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[CRON ERROR - monthly report]", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  } finally {
    isMonthlyReportRunning = false;
  }
};

export const runMonthlyReportManually = async (req, res) => {
  try {
    const result = await generateMonthlyReport();

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[MANUAL MONTHLY REPORT ERROR]", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

export const listMonthlyReports = async (req, res) => {
  try {
    const reports = await getMonthlyReports();

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("[LIST MONTHLY REPORTS ERROR]", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};
