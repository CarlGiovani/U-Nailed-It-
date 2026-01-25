import express from "express";
import * as ServicesController from "../../controllers/Services_Feature/serviceController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";
import serviceImageUpload from "../../middlewares/uploads/serviceImageUpload.js";
const router = express.Router();
// PUBLIC
router.get("/", ServicesController.getServices);

// SERVICE CATEGORIES
router.post("/categories", verifyAdmin, ServicesController.createCategory);
router.put("/categories/:id", verifyAdmin, ServicesController.updateCategory);
router.delete("/categories/:id", verifyAdmin, ServicesController.deleteCategory);

// SERVICE VARIANTS
router.post("/variants", verifyAdmin, ServicesController.createVariant);
router.put("/variants/:id", verifyAdmin, ServicesController.updateVariant);
router.delete("/variants/:id", verifyAdmin, ServicesController.deleteVariant);

// SERVICES (ADMIN)
router.get("/:id", verifyAdmin, ServicesController.getService);
router.post( "/", verifyAdmin, serviceImageUpload.single("file"), ServicesController.createService);
router.put("/:id", verifyAdmin, serviceImageUpload.single("file"), ServicesController.updateService);
router.delete("/:id", verifyAdmin, ServicesController.deleteService);
router.put("/:id/reactivate", verifyAdmin, ServicesController.reactivateService);

export default router;
