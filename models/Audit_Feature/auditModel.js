import { supabaseAdmin } from "../../utils/supabaseClient.js";

/* ===============================
   CREATE LOG
=============================== */
export const createAuditLog = async ({
  admin_id,
  action,
  entity,
  entity_id,
  description,
}) => {
  const { error } = await supabaseAdmin.from("audit_logs").insert([
    {
      admin_id,
      action,
      entity,
      entity_id,
      description,
    },
  ]);

  if (error) throw new Error(error.message);
};

/* ===============================
   GET LOGS
=============================== */
export const getAuditLogs = async () => {
  const { data, error } = await supabaseAdmin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  return data;
};
