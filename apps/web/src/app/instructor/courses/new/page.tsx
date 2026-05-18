"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PB = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

export default function NewCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", slug: "", subtitle: "", description: "",
    category: "", price: 0, discount_price: 0,
    level: "all", language: "Indonesia",
    what_you_will_learn: "", requirements: "", target_audience: "",
    status: "draft", is_featured: false,
  });

  useEffect(() => {
    fetch(`${PB}/api/collections/categories/records?sort=sort_order&perPage=20`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCategories(d.items || []))
      .catch(() => {});
  }, []);

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Judul wajib diisi"); return; }

    setSaving(true);
    try {
      const slug = form.slug || generateSlug(form.title);
      const res = await fetch(`${PB}/api/collections/courses/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug,
          price: Number(form.price) || 0,
          discount_price: Number(form.discount_price) || 0,
          category: form.category || null,
          total_lectures: 0,
          total_students: 0,
          average_rating: 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.data?.message || data?.message || "Gagal menyimpan");
      }

      const course = await res.json();
      router.push(`/instructor/courses/${course.id}/curriculum`);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally { setSaving(false); }
  }

  const LEVELS = [
    { value: "all", label: "Semua Level" },
    { value: "beginner", label: "Pemula" },
    { value: "intermediate", label: "Menengah" },
    { value: "advanced", label: "Mahir" },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/instructor/courses" className="text-sm text-indigo-600 hover:text-indigo-500">← Kembali ke Kursus Saya</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Buat Kursus Baru</h1>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-400">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Section title="Informasi Dasar">
          <Field label="Judul Kursus" required>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contoh: Belajar React dari Nol" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" required />
          </Field>
          <Field label="Slug (URL)">
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder={generateSlug(form.title) || "auto-generated"} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" />
            <p className="mt-1 text-xs text-gray-400">Kosongkan untuk generate otomatis dari judul</p>
          </Field>
          <Field label="Subtitle">
            <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Satu kalimat deskripsi singkat" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" />
          </Field>
          <Field label="Deskripsi">
            <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi lengkap kursus..." className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" />
          </Field>
          <Field label="Thumbnail (upload via PocketBase admin UI)">
            <p className="text-xs text-gray-400">Untuk upload thumbnail, gunakan PocketBase admin panel di <a href="http://localhost:8090/_/" target="_blank" className="text-indigo-500">http://localhost:8090/_/</a></p>
          </Field>
        </Section>

        {/* Kategori & Level */}
        <Section title="Kategori & Level">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Kategori">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm">
                <option value="">Pilih kategori</option>
                {categories.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </Field>
            <Field label="Level">
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm">
                {LEVELS.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
              </select>
            </Field>
          </div>
          <Field label="Bahasa">
            <input type="text" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" />
          </Field>
        </Section>

        {/* Harga */}
        <Section title="Harga">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Harga Normal (Rp)">
              <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" />
            </Field>
            <Field label="Harga Diskon (Rp)">
              <input type="number" min={0} value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" />
            </Field>
          </div>
        </Section>

        {/* Konten */}
        <Section title="Konten Kursus">
          <Field label="Yang Akan Dipelajari (HTML)">
            <textarea rows={4} value={form.what_you_will_learn} onChange={(e) => setForm({ ...form, what_you_will_learn: e.target.value })} placeholder="<ul><li>Point 1</li><li>Point 2</li></ul>" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-mono" />
          </Field>
          <Field label="Prasyarat (HTML)">
            <textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="<p>Pengetahuan dasar...</p>" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-mono" />
          </Field>
          <Field label="Target Audiens (HTML)">
            <textarea rows={3} value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} placeholder="<p>Kursus ini untuk...</p>" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-mono" />
          </Field>
        </Section>

        {/* Status */}
        <Section title="Status">
          <div className="flex gap-3">
            <button type="submit" name="status" value="draft" onClick={() => setForm((f) => ({ ...f, status: "draft" }))}
              className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${form.status === "draft" ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300" : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"}`}>
              Simpan sebagai Draft
            </button>
            <button type="submit" name="status" value="published" onClick={() => setForm((f) => ({ ...f, status: "published" }))}
              className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${form.status === "published" ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"}`}>
              Publikasikan
            </button>
          </div>
        </Section>

        <div className="flex justify-end gap-3 pb-8">
          <Link href="/instructor/courses" className="rounded-lg border border-gray-300 dark:border-gray-700 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Batal</Link>
          <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {saving ? "Menyimpan..." : form.status === "published" ? "Publikasikan" : "Simpan Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}{required && " *"}</label>
      {children}
    </div>
  );
}
