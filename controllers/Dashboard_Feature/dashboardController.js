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

export const blockCustomer = async (req, res) => {
  try {
    const { email, name, reason, cancelCount } = req.body;

    const data = await dashboardService.blockCustomer({
      email,
      name,
      reason,
      cancelCount,
      adminId: req.user?.id || null,
    });

    res.json({
      message: "Customer blocked successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const unblockCustomer = async (req, res) => {
  try {
    const { customer_id } = req.body;

    const data = await dashboardService.unblockCustomer({
      customer_id,
    });

    res.json({
      message: "Customer unblocked successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const getBookingSnapshot = async (req, res) => {
  try {
    const data = await dashboardService.getBookingSnapshot();

    res.json({
      message: "Booking snapshot fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};