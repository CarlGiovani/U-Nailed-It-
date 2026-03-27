import * as auditService from "../../services/Audit_Service/auditService.js";  

export const getAuditLogs = async (req , res) => {
  try {
    const logs = await auditService.getAuditLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({error: error.message}); 
  };
};


