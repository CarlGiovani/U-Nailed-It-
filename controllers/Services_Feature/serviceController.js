import * as Services from "../../models/Services_Feature/serviceModel.js";

// GET all services
export const getServices = async (req, res) => {
  try {
    const services = await Services.getAllServices();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET service by ID
export const getService = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await Services.getServiceById(id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE service
export const createService = async (req, res) => {
  try {
    const newService = await Services.createService({
      file: req.file,
      ...req.body,
    });
    res.json({ message: "Service created!", service: newService });

    console.log("req.file:", req.file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE service
export const updateService = async (req, res) => {
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
    const deletedService = await Services.deleteService(id);
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
