"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const PB = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

export default function AnnouncementsPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [cRes, aRes] = await Promise.all([
        fetch(`${PB}/api/collections/courses/records/${courseId}`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`${PB}/api/collections/announcements/records?filter=${encodeURIComponent(`course="${courseId}"`)}&sort=-created&perPage=20`, { cache: "no-store" }).then((r) => r.json()),
      ]);
      setCourse(cRes);
      setAnnouncements(aRes.items || []);
    } catch {} finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await fetch(`${PB}/api/collections/announcements/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: courseId, title, content }),
      });
      setTitle(""); setContent(""); load();
    } catch {} finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pengumuman ini?")) return;
    await fetch(`${PB}/api/collections/announcements/records/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Memuat...</div>;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/instructor/courses" className="text-sm text-indigo-600 hover:text-indigo-500">← Kembali</Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Pengumuman: {course?.title || ""}</h1>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
        <input type="text" placeholder="Judul pengumuman" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" required />
        <textarea rows={4} placeholder="Isi pengumuman..." value={content} onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" />
        <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
          {saving ? "Menyimpan..." : "Kirim Pengumuman"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {announcements.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada pengumuman.</p>
        ) : (
          announcements.map((a: any) => (
            <div key={a.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{a.content}</p>
                  <p className="mt-2 text-xs text-gray-400">{new Date(a.created).toLocaleDateString("id-ID")}</p>
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500 hover:text-red-400">Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
