// ============================================
// KuliahOnlineIT - Notification Hook
// ============================================

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./auth-context";

const PB = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

export interface Notification {
  id: string;
  user: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  data?: any;
  created: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setNotifications([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `${PB}/api/collections/notifications/records?filter=${encodeURIComponent(`user="${user.id}"`)}&sort=-created&perPage=20`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.items || []);
      }
    } catch {} finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const recentUnread = notifications.filter((n) => !n.is_read).slice(0, 5);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`${PB}/api/collections/notifications/records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.is_read);
    for (const n of unread) {
      await fetch(`${PB}/api/collections/notifications/records/${n.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, [notifications]);

  return { notifications, loading, unreadCount, recentUnread, markAsRead, markAllAsRead, refresh: load };
}
