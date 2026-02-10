import * as policiesModel from "../../models/Policies_Feature/policiesModel.js";

/* ==========================================
   PUBLIC: getAllactivePolicies
========================================== */
export const getActivePolicies = async (req, res) => {
  try {
    const policies = await policiesModel.fetchtActivePolicies();
    res.json(policies);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* ==========================================
   ADMIN: getAlLPOLICIES
========================================== */
export const getAllPolicies = async (req, res) => {
  try {
    const policies = await policiesModel.fetchAllPolicies();
    res.json(policies);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* ==========================================
   ADMIN: InsertPolict
========================================== */
export const createPolicty = async (req, res) => {
  try {
    const { title, content, is_active } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "Title and content are requried" });

    const policy = await policiesModel.insertPolicy({
      title,
      content,
      is_active,
    });
    res.status(201).json(policy);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

/* ==========================================
   ADMIN: updatePolicy
========================================== */
export const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await policiesModel.updatePolicyById(id, req.body);
    res.json(policy);
  } catch (error) {
    return res.status(400).json({ errro: error.message });
  }
};

/* ==========================================
   ADMIN: delete
========================================== */
export const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    await policiesModel.deletePolicyById(id);
    res.json({ sucess: "true" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
