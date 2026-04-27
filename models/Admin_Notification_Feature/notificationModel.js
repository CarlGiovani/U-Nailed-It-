import { supabaseAdmin } from "../../utils/supabaseClient.js";
export const NotificationModel = {
  async getAll(adminId, limit = 20) {
    if (!adminId) {
      throw new Error("Admin id is required");
    }

    const safeLimit = Number(limit) || 20;

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("admin_id", adminId)
      .order("created_at", { ascending: false })
      .limit(safeLimit);

    if (error) throw error;
    return data || [];
  },

  async getUnreadCount(adminId) {
    if (!adminId) {
      throw new Error("Admin id is required");
    }

    const { count, error } = await supabaseAdmin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("admin_id", adminId)
      .eq("is_read", false);

    if (error) throw error;
    return count || 0;
  },

  async markAsRead(id, adminId) {
    const notifId = Number(id);

    if (!adminId) {
      throw new Error("Admin id is required");
    }

    if (!notifId || Number.isNaN(notifId)) {
      throw new Error("Invalid notification id");
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notifId)
      .eq("admin_id", adminId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAllAsRead(adminId) {
    if (!adminId) {
      throw new Error("Admin id is required");
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("admin_id", adminId)
      .eq("is_read", false)
      .select();

    if (error) throw error;
    return data || [];
  },

  async deleteOne(id, adminId) {
    const notifId = Number(id);

    if (!adminId) {
      throw new Error("Admin id is required");
    }

    if (!notifId || Number.isNaN(notifId)) {
      throw new Error("Invalid notification id");
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("id", notifId)
      .eq("admin_id", adminId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async deleteBulk(ids = [], adminId) {
    if (!adminId) {
      throw new Error("Admin id is required");
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("ids must be a non-empty array");
    }

    const normalizedIds = [
      ...new Set(
        ids.map(Number).filter((id) => Number.isInteger(id) && id > 0),
      ),
    ];

    if (normalizedIds.length === 0) {
      throw new Error("No valid notification ids provided");
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("admin_id", adminId)
      .in("id", normalizedIds)
      .select();

    if (error) throw error;
    return data || [];
  },
};
