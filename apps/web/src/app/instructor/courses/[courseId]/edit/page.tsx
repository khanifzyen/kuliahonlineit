"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const PB = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<any>({});
  const [original, setOriginal] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${PB}/api/collections/categories/records?sort=sort_order&perPage=20`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${PB}/api/collections/courses/records/${courseId}`, { cache: "no-store" }).then((r) => r.json()),
    ]).then(([catData, course]) => {
      setCategories(catData.items || []);
      setForm({
        title: course.title || "",
        slug: course.slug || "",
        subtitle: course.subtitle || "",
        description: course.description || "",
        category: course.category || "",
        price: course.price || 0,
        discount_price: course.discount_price || 0,
        level: course.level || "all",
        language: course.language || "Indonesia",
        status: course.status || "draft",
        is_featured: course.is_featured || false,
        what_you_will_learn: course.what_you_will_learn || "",
        requirements: course.requirements || "",
        target_audience: course.target_audience || "",
      });
      setOriginal(course);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [courseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.title?.trim()) { setError("Judul wajib diisi"); return; }

    setSaving(true);
    try {
      const res = await fetch(`${PB}/api/collections/courses/records/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price) || 0,
          discount_price: Number(form.discount_price) || 0,
          category: form.category || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.data?.message || data?.message || "Gagal menyimpan");
      }
      setSuccess("Kursus berhasil disimpan!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm("Hapus kursus ini? Semua data (section, lecture, enrollment) akan ikut terhapus.")) return;
    setSaving(true);
    try {
      await fetch(`${PB}/api/collections/courses/records/${courseId}`, { method: "DELETE" });
      router.push("/instructor/courses");
    } catch (err: any) {
      setError(err.message || "Gagal menghapus");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Memuat...</div>;

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
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Edit Kursus</h1>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-400">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/30 p-3 text-sm text-green-700 dark:text-green-400">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Informasi Dasar">
          <Field label="Judul Kursus" required>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" required />
          </Field>
          <Field label="Slug">
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" />
          </Field>
          <Field label="Subtitle">
            <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" />
          </Field>
          <Field label="Deskripsi">
            <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" />
          </Field>
        </Section>

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

        <Section title="Konten">
          <Field label="Yang Akan Dipelajari">
            <textarea rows={4} value={form.what_you_will_learn} onChange={(e) => setForm({ ...form, what_you_will_learn: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-mono" />
          </Field>
          <Field label="Prasyarat">
            <textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-mono" />
          </Field>
          <Field label="Target Audiens">
            <textarea rows={3} value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-mono" />
          </Field>
        </Section>

        <Section title="Status">
          <div className="flex gap-3">
            {["draft", "published", "archived"].map((s) => (
              <button key={s} type="button" onClick={() => setForm((f: any) => ({ ...f, status: s }))}
                className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors capitalize ${
                  form.status === s
                    ? s === "published" ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : s === "draft" ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                      : "border-gray-400 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                }`}>{s}</button>
            ))}
          </div>
        </Section>

        <div className="flex justify-between gap-3 pb-8">
          <button type="button" onClick={handleDelete} className="rounded-lg border border-red-300 dark:border-red-800 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
            Hapus Kursus
          </button>
          <div className="flex gap-3">
            <Link href={`/instructor/courses/${courseId}/curriculum`} className="rounded-lg border border-gray-300 dark:border-gray-700 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              Kelola Kurikulum
            </Link>
            <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
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
