import * as Services from "../../models/Services_Feature/serviceModel.js";
import { serviceSchema, categorySchema, variantSchema, validate } from "../../utils/validators/serviceValidation.js";

// GET all services
export const getServices = async (req, res) => {
  try {
    const services = await Services.getAllServices(); // only active variants returned now
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET service by ID
export const getService = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await Services.getServiceById(id); // nested categories & active variants fetched
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE service
export const createService = async (req, res) => {
  // ---- VALIDATION ----
  const errors = validate(serviceSchema, req.body);
  if (errors) return res.status(400).json({ errors });

  try {
    const newService = await Services.createService({
      file: req.file,
      ...req.body,
    });
    res.json({ message: "Service created!", service: newService });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE service
export const updateService = async (req, res) => {
  // ---- VALIDATION ----
  const errors = validate(serviceSchema, req.body);
  if (errors) return res.status(400).json({ errors });

  const { id } = req.params;
  try {
    const updatedService = await Services.updateService(id, {
      ...req.body,
      file: req.file, // multer file kung may image
    });
    res.json({ message: "Service updated!", service: updatedService });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE / Deactivate service
export const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedService = await Services.deleteService(id); // soft delete
    res.json({ message: "Service deactivated!", service: deletedService });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REACTIVATE service
export const reactivateService = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await Services.reactivateService(id);
    res.json({ message: "Service reactivated!", service });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE SERVICE CATEGORY
export const createCategory = async (req, res) => {
  // ---- VALIDATION ----
  const errors = validate(categorySchema, req.body);
  if (errors) return res.status(400).json({ errors });

  try {
    const { service_id, name } = req.body;
    const category = await Services.createCategory(service_id, name);
    res.json({ message: "category created!!", category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE SERVICE CATEGORY
export const updateCategory = async (req, res) => {
  // ---- VALIDATION ----
  const errors = validate(categorySchema, req.body);
  if (errors) return res.status(400).json({ errors });

  const { id } = req.params;  
  const { name } = req.body;

  try {
    const category = await Services.updateCategory(id, name);
    res.json({ message: "category updated!!", category });  
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE SERVICE CATEGORY
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Services.deleteCategory(id); // soft delete now
    res.json({ message: "category deactivated!", category });
  } catch (error) {
    res.status(500).json({ error: error.message });  
  }
};

// CREATE SERVICE VARIANT
export const createVariant = async (req, res) => {
  // ---- VALIDATION ----
  const errors = validate(variantSchema, req.body);
  if (errors) return res.status(400).json({ errors });

  try {
    const variant = await Services.createVariant(req.body);
    res.json({ message: "Variant created!", variant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE SERVICE VARIANT
export const updateVariant = async (req, res) => {
  // ---- VALIDATION ----
  const errors = validate(variantSchema, req.body);
  if (errors) return res.status(400).json({ errors });

  const { id } = req.params;
  try {
    const variant = await Services.updateVariant(id, req.body);
    res.json({ message: "Variant updated!", variant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE SERVICE VARIANT
export const deleteVariant = async (req, res) => {
  const { id } = req.params;
  try {
    const variant = await Services.deleteVariant(id); // soft delete
    res.json({ message: "Variant deactivated!", variant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
