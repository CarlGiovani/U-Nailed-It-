// frontend/portfolioApi.js
import api from "../config/axios.js";

/* ================= CREATE PORTFOLIO ITEM ================= */
export const addPortfolioItem = async (formData) => {
  try {
    console.log("📤 Creating new portfolio item...");
    const res = await api.post("/portfolio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("✅ Portfolio created:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Portfolio creation error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/* ================= GET ALL PORTFOLIO ITEMS ================= */
export const getAllPortfolio = async () => {
  try {
    console.log("📋 Fetching all portfolio items...");
    const res = await api.get("/portfolio");
    console.log("✅ Portfolio items retrieved:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Fetch all portfolio error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/* ================= GET PORTFOLIO BY ID ================= */
export const getPortfolioById = async (id) => {
  try {
    console.log(`📋 Fetching portfolio item #${id}...`);
    const res = await api.get(`/portfolio/${id}`);
    console.log("✅ Portfolio item retrieved:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Get portfolio by ID error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/* ================= UPDATE PORTFOLIO ITEM ================= */
export const updatePortfolioItem = async (id, formData) => {
  try {
    console.log(`🔄 Updating portfolio item #${id}...`);
    const res = await api.put(`/portfolio/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("✅ Portfolio item updated:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Update portfolio error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/* ================= DELETE PORTFOLIO ITEM ================= */
export const deletePortfolioItem = async (id) => {
  try {
    console.log(`🗑 Deleting portfolio item #${id}...`);
    const res = await api.delete(`/portfolio/${id}`);
    console.log("✅ Portfolio item deleted:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Delete portfolio error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
