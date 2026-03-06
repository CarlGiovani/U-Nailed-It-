import * as auditController from "../../controllers/Audit_Feature/auditController.js";  
import express from "express";  
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

router.get("/logs", verifyAdmin, auditController.getAuditLogs);

export default router;