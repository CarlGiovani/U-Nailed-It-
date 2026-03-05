import api from "../axios";

/* ===============================
   PORTFOLIO (PUBLIC)
================================= */

// GET ALL PORTFOLIO ITEMS
export const getAllPortfolio = async () => {
  const res = await api.get("/portfolio");
  return res.data;
};

// GET PORTFOLIO BY ID
export const getPortfolioById = async (id) => {
  const res = await api.get(`/portfolio/${id}`);
  return res.data;
};

/* ===============================
   PORTFOLIO (ADMIN)
================================= */

// CREATE PORTFOLIO ITEM
export const createPortfolio = async (formData) => {
  const res = await api.post("/portfolio", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// UPDATE PORTFOLIO ITEM
export const updatePortfolio = async (id, formData) => {
  const res = await api.put(`/portfolio/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// DELETE PORTFOLIO ITEM
export const deletePortfolio = async (id) => {
  const res = await api.delete(`/portfolio/${id}`);
  return res.data;
};
