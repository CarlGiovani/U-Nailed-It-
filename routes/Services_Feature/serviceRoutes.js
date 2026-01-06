import express from "express";
import * as ServicesController from "../../controllers/Services_Feature/serviceController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

// PUBLIC: GET all services
router.get("/", ServicesController.getServices);

// ADMIN: GET single service
router.get("/:id", verifyAdmin , ServicesController.getService);

// ADMIN: CREATE service
router.post("/",verifyAdmin , ServicesController.createService);

// ADMIN: UPDATE service
router.put("/:id", verifyAdmin ,ServicesController.updateService);

// ADMIN: DELETE / deactivate service
router.delete("/:id", verifyAdmin , ServicesController.deleteService);

export default router;
