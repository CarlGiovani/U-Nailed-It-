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

export default router;
