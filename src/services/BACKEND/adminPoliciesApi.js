import api from "../axios";

/* ===============================
POLICIES (PUBLIC)
================================= */

// GET ACTIVE POLICIES
export const getActivePolicies = async () => {
  const res = await api.get("/policies");
  return res.data;
};

/* ===============================
POLICIES (ADMIN)
================================= */

// GET ALL POLICIES
export const getAllPolicies = async () => {
  const res = await api.get("/policies/admin");
  return res.data;
};

// CREATE POLICY
export const createPolicy = async (payload) => {
  const res = await api.post("/policies", payload);
  return res.data;
};

// UPDATE POLICY
export const updatePolicy = async (id, payload) => {
  const res = await api.put(`/policies/${id}`, payload);
  return res.data;
};

// DELETE POLICY
export const deletePolicy = async (id) => {
  const res = await api.delete(`/policies/${id}`);
  return res.data;
};
