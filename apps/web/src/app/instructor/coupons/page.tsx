"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const PB = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", discount_type: "percentage", discount_value: 0,
    course: "", max_uses: 0, expires_at: "", is_active: true,
  });

  const load = useCallback(async () => {
    try {
      const [coupRes, courseRes] = await Promise.all([
        fetch(`${PB}/api/collections/coupons/records?sort=-created&expand=course&perPage=30`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`${PB}/api/collections/courses/records?perPage=50&sort=-created`, { cache: "no-store" }).then((r) => r.json()),
      ]);
      setCoupons(coupRes.items || []);
      setCourses(courseRes.items || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) return;
    setSaving(true);
    try {
      await fetch(`${PB}/api/collections/coupons/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          code: form.code.toUpperCase(),
          discount_value: Number(form.discount_value),
          max_uses: Number(form.max_uses) || 0,
          current_uses: 0,
          course: form.course || null,
          expires_at: form.expires_at || null,
        }),
      });
      setForm({ code: "", discount_type: "percentage", discount_value: 0, course: "", max_uses: 0, expires_at: "", is_active: true });
      setShowForm(false);
      load();
    } catch {} finally { setSaving(false); }
  }

  async function toggleActive(coupon: any) {
    await fetch(`${PB}/api/collections/coupons/records/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kupon ini?")) return;
    await fetch(`${PB}/api/collections/coupons/records/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Memuat...</div>;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kupon Diskon</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola kode diskon untuk kursus Anda</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          {showForm ? "Batal" : "+ Kupon Baru"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Kode Kupon</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="HEMAT50" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm uppercase" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipe</label>
              <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
                <option value="percentage">Persen (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nilai Diskon</label>
              <input type="number" min={0} value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Maksimal Penggunaan (0 = tak terbatas)</label>
              <input type="number" min={0} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Kursus (opsional)</label>
              <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
                <option value="">Semua kursus</option>
                {courses.map((c: any) => (<option key={c.id} value={c.id}>{c.title}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Berlaku Sampai (opsional)</label>
              <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {saving ? "Menyimpan..." : "Buat Kupon"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {coupons.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada kupon.</p>
        ) : (
          coupons.map((c: any) => (
            <div key={c.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-900 dark:text-white">{c.code}</code>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                      {c.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : `Rp${c.discount_value.toLocaleString("id-ID")}`}
                    {c.course ? ` — ${c.expand?.course?.title || "Kursus spesifik"}` : " — Semua kursus"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Digunakan {c.current_uses || 0}{c.max_uses > 0 ? ` / ${c.max_uses}x` : ""}
                    {c.expires_at ? ` · Kadaluarsa: ${new Date(c.expires_at).toLocaleDateString("id-ID")}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(c)} className={`text-xs px-2 py-1 rounded ${c.is_active ? "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20" : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"}`}>
                    {c.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:text-red-400">Hapus</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
