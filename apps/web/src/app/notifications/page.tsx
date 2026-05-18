"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const PB = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

interface Notification {
  id: string; title: string; message?: string; link?: string;
  is_read: boolean; type: string; created: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetch(`${PB}/api/collections/notifications/records?filter=${encodeURIComponent(`user="${user.id}"`)}&sort=-created&perPage=50`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setNotifications(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  async function markAllRead() {
    if (!user) return;
    for (const n of notifications.filter((n) => !n.is_read)) {
      await fetch(`${PB}/api/collections/notifications/records/${n.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function markRead(id: string) {
    await fetch(`${PB}/api/collections/notifications/records/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: true }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }

  if (!user) return <div className="p-8 text-center text-gray-400">Silakan login</div>;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifikasi</h1>
          <p className="text-sm text-gray-500">Semua notifikasi Anda</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={markAllRead} className="text-sm text-indigo-600 hover:text-indigo-500">Tandai semua sudah dibaca</button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Memuat...</p>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Belum ada notifikasi.</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link || "#"}
              onClick={() => { if (!n.is_read) markRead(n.id); }}
              className={`block rounded-xl border p-4 transition-colors ${
                n.is_read
                  ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  : "border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.is_read ? "text-gray-900 dark:text-white" : "font-semibold text-gray-900 dark:text-white"}`}>
                    {n.title}
                  </p>
                  {n.message && <p className="text-xs text-gray-500 mt-1">{n.message}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created).toLocaleDateString("id-ID", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                {!n.is_read && <span className="h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
