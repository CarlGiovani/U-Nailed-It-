import express from "express";
import * as ServicesController from "../../controllers/Services_Feature/serviceController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";
import serviceImageUpload from "../../middlewares/uploads/serviceImageUpload.js";
const router = express.Router();

// PUBLIC: GET all services
router.get("/", ServicesController.getServices);

// ADMIN: GET single service
router.get("/:id", verifyAdmin, ServicesController.getService);

// ADMIN: CREATE service
router.post(
  "/",
  verifyAdmin,
  serviceImageUpload.single("file"),
  ServicesController.createService
);

// ADMIN: UPDATE service
router.put(
  "/:id",
  verifyAdmin,
  serviceImageUpload.single("file"), // para sa bagong image
  ServicesController.updateService
);

// ADMIN: DELETE / deactivate service
router.delete("/:id", verifyAdmin, ServicesController.deleteService);


// ADMIN: Reactivate service
router.put("/:id/reactivate", verifyAdmin, ServicesController.reactivateService);




// SERVICE CATEGORIES
router.post("/categories", verifyAdmin, ServicesController.createCategory);
router.put("/categories/:id", verifyAdmin, ServicesController.updateCategory);
router.delete("/categories/:id", verifyAdmin, ServicesController.deleteCategory);

// SERVICE VARIANTS
router.post("/variants", verifyAdmin, ServicesController.createVariant);
router.put("/variants/:id", verifyAdmin, ServicesController.updateVariant);
router.delete("/variants/:id", verifyAdmin, ServicesController.deleteVariant);



export default router;
