import * as dashboardService from "../../services/Dashboard_Service/dashboardService.js";

export const getDashboardData = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Dashboard error:", error);
  }
};

export const getSystemExportData = async (req, res) => {
  try {
    const data = await dashboardService.getSystemExportData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
