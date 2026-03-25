import supabase from "../../utils/supabaseClient.js";

export const NotificationModel = {
  async getAll(limit = 20) {
    const safeLimit = Number(limit) || 20;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(safeLimit);

    if (error) throw error;
    return data || [];
  },

  async getUnreadCount() {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);

    if (error) throw error;
    return count || 0;
  },

  async markAsRead(id) {
    const notifId = Number(id);

    if (!notifId || Number.isNaN(notifId)) {
      throw new Error("Invalid notification id");
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notifId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAllAsRead() {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    if (error) throw error;
    return true;
  },

  async deleteOne(id) {
    const notifId = Number(id);

    if (!notifId || Number.isNaN(notifId)) {
      throw new Error("Invalid notification id");
    }

    const { data, error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notifId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBulk(ids = []) {
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

    const { data, error } = await supabase
      .from("notifications")
      .delete()
      .in("id", normalizedIds)
      .select();

    if (error) throw error;
    return data || [];
  },
};
