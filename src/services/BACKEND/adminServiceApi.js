import api from "../axios";

/* ===============================
   SERVICES (ADMIN)
================================= */

// GET ALL SERVICES (ADMIN)
export const getAllServicesAdmin = async () => {
  const res = await api.get("/services/admin/all");
  return res.data;
};

// CREATE SERVICE
export const createService = async (formData) => {
  const res = await api.post("/services", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// UPDATE SERVICE
export const updateService = async (id, formData) => {
  const res = await api.put(`/services/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// DELETE SERVICE (soft delete)
export const deleteService = async (id) => {
  const res = await api.delete(`/services/${id}`);
  return res.data;
};

// REACTIVATE SERVICE
export const reactivateService = async (id) => {
  const res = await api.put(`/services/${id}/reactivate`);
  return res.data;
};

/* ===============================
   SERVICE CATEGORIES (ADMIN)
================================= */

// CREATE CATEGORY
export const createCategory = async (data) => {
  const res = await api.post("/services/categories", data);
  return res.data;
};

// UPDATE CATEGORY
export const updateCategory = async (id, data) => {
  const res = await api.put(`/services/categories/${id}`, data);
  return res.data;
};

// DELETE CATEGORY
export const deleteCategory = async (id) => {
  const res = await api.delete(`/services/categories/${id}`);
  return res.data;
};

/* ===============================
   SERVICE VARIANTS (ADMIN)
================================= */

// CREATE VARIANT
export const createVariant = async (data) => {
  const res = await api.post("/services/variants", data);
  return res.data;
};

// UPDATE VARIANT
export const updateVariant = async (id, data) => {
  const res = await api.put(`/services/variants/${id}`, data);
  return res.data;
};

// DELETE VARIANT
export const deleteVariant = async (id) => {
  const res = await api.delete(`/services/variants/${id}`);
  return res.data;
};
