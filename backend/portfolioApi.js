// frontend/portfolioApi.js
import api from "../config/axios.js";

/* ================= CREATE PORTFOLIO ITEM ================= */
export const addPortfolioItem = async (formData) => {
  try {
    const res = await api.post("/portfolio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Portfolio creation error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/* ================= GET ALL PORTFOLIO ITEMS ================= */
export const getAllPortfolio = async () => {
  try {
    const res = await api.get("/portfolio");

    return res.data;
  } catch (error) {
    console.error(
      "Fetch all portfolio error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/* ================= GET PORTFOLIO BY ID ================= */
export const getPortfolioById = async (id) => {
  try {
    const res = await api.get(`/portfolio/${id}`);

    return res.data;
  } catch (error) {
    console.error(
      "Get portfolio by ID error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/* ================= UPDATE PORTFOLIO ITEM ================= */
export const updatePortfolioItem = async (id, formData) => {
  try {
    const res = await api.put(`/portfolio/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Update portfolio error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/* ================= DELETE PORTFOLIO ITEM ================= */
export const deletePortfolioItem = async (id) => {
  try {
    const res = await api.delete(`/portfolio/${id}`);

    return res.data;
  } catch (error) {
    console.error(
      " Delete portfolio error:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
