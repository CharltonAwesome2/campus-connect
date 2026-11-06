// src/lib/data/notifications.js
import { supabase } from "../supabase";

export const notificationsRepo = {
  async getNotifications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, body, is_read, link, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;

    return (data || []).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      isRead: n.is_read,
      link: n.link,
      createdAt: n.created_at,
    }));
  },

  async markNotificationRead(id) {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    if (error) throw error;
    return this.getNotifications();
  },

  async markAllNotificationsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    if (error) throw error;
    return this.getNotifications();
  },
};