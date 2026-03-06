import * as auditMoodel from "../../models/Audit_Feature/auditModel.js";

export const logAction = async (data) => {
  await auditMoodel.createAuditLog(data);
};

export const getAuditLogs = async () => {
  const logs = await auditMoodel.getAuditLogs();
  return logs;
};
