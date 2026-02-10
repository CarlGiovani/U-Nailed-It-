import express from "express";
import * as policiesController from "../../controllers/Policies_Feature/policiesController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";
const router = express.Router();

//PUBLIC
router.get("/", policiesController.getActivePolicies);

//ADMIN
router.post("/", verifyAdmin, policiesController.createPolicty);
router.get("/admin", verifyAdmin, policiesController.getAllPolicies);
router.put("/:id", verifyAdmin, policiesController.updatePolicy);
router.delete("/:id", verifyAdmin, policiesController.deletePolicy);

export default router;
