import { supabase } from "../config/db.js";

export async function audit({ actor_type, actor_id = null, action, meta = {} }) {
  await supabase.from("audit_logs").insert([{ actor_type, actor_id, action, meta }]);
}


