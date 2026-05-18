"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const PB = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

export default function CurriculumPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [courseRes, sectionsRes] = await Promise.all([
        fetch(`${PB}/api/collections/courses/records/${courseId}`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`${PB}/api/collections/sections/records?filter=${encodeURIComponent(`course="${courseId}"`)}&sort=sort_order&perPage=30`, { cache: "no-store" }).then((r) => r.json()),
      ]);
      setCourse(courseRes);
      const sectionsData = sectionsRes.items || [];

      // Load lectures for each section
      const sectionsWithLectures = await Promise.all(
        sectionsData.map(async (s: any) => {
          const lecRes = await fetch(`${PB}/api/collections/lectures/records?filter=${encodeURIComponent(`section="${s.id}"`)}&sort=sort_order&perPage=50`, { cache: "no-store" }).then((r) => r.json());
          return { ...s, lectures: lecRes.items || [] };
        })
      );
      setSections(sectionsWithLectures);
    } catch {} finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Section operations
  const [newSectionTitle, setNewSectionTitle] = useState("");

  async function addSection() {
    if (!newSectionTitle.trim()) return;
    const res = await fetch(`${PB}/api/collections/sections/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course: courseId, title: newSectionTitle, sort_order: sections.length + 1 }),
    });
    if (res.ok) { setNewSectionTitle(""); loadData(); }
  }

  async function deleteSection(sectionId: string) {
    if (!confirm("Hapus section ini beserta semua lecture di dalamnya?")) return;
    await fetch(`${PB}/api/collections/sections/records/${sectionId}`, { method: "DELETE" });
    loadData();
  }

  async function moveSection(sectionId: string, direction: "up" | "down") {
    const idx = sections.findIndex((s: any) => s.id === sectionId);
    if (idx < 0) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;

    const current = sections[idx];
    const neighbor = sections[newIdx];
    await Promise.all([
      fetch(`${PB}/api/collections/sections/records/${current.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: neighbor.sort_order }),
      }),
      fetch(`${PB}/api/collections/sections/records/${neighbor.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: current.sort_order }),
      }),
    ]);
    loadData();
  }

  // Lecture operations
  const [showLectureForm, setShowLectureForm] = useState<string | null>(null);
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const [lectureForm, setLectureForm] = useState({
    title: "", type: "video", video_url: "", article_content: "", resource_file: null as any,
    video_duration: 0, is_free_preview: false,
    sort_order: 0, is_published: true,
  });

  function openLectureForm(sectionId: string, lecture?: any) {
    if (lecture) {
      setLectureForm({
        title: lecture.title || "", type: lecture.type || "video",
        video_url: lecture.video_url || "", article_content: lecture.article_content || "",
        video_duration: lecture.video_duration || 0, is_free_preview: lecture.is_free_preview || false,
        sort_order: lecture.sort_order || 0, is_published: lecture.is_published ?? true,
        resource_file: null,
      });
      setEditingLectureId(lecture.id);
    } else {
      const section = sections.find((s: any) => s.id === sectionId);
      setLectureForm({ title: "", type: "video", video_url: "", article_content: "",
        video_duration: 0, is_free_preview: false, sort_order: (section?.lectures?.length || 0) + 1, is_published: true,
        resource_file: null });
      setEditingLectureId(null);
    }
    setShowLectureForm(sectionId);
  }

  async function addLecture(sectionId: string) {
    if (!lectureForm.title.trim()) return;
    const body: any = { section: sectionId, ...lectureForm };
    if (body.resource_file) delete body.resource_file;

    const isEdit = !!editingLectureId;
    const url = isEdit
      ? `${PB}/api/collections/lectures/records/${editingLectureId}`
      : `${PB}/api/collections/lectures/records`;
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setShowLectureForm(null); setEditingLectureId(null); loadData(); }
  }

  async function deleteLecture(lectureId: string) {
    if (!confirm("Hapus lecture ini?")) return;
    await fetch(`${PB}/api/collections/lectures/records/${lectureId}`, { method: "DELETE" });
    loadData();
  }

  async function toggleFreePreview(lectureId: string, current: boolean) {
    await fetch(`${PB}/api/collections/lectures/records/${lectureId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_free_preview: !current }),
    });
    loadData();
  }

  async function moveLecture(lectureId: string, sectionId: string, direction: "up" | "down") {
    const section = sections.find((s: any) => s.id === sectionId);
    if (!section) return;
    const lecs = section.lectures;
    const idx = lecs.findIndex((l: any) => l.id === lectureId);
    if (idx < 0) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= lecs.length) return;

    const current = lecs[idx];
    const neighbor = lecs[newIdx];
    await Promise.all([
      fetch(`${PB}/api/collections/lectures/records/${current.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: neighbor.sort_order }),
      }),
      fetch(`${PB}/api/collections/lectures/records/${neighbor.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: current.sort_order }),
      }),
    ]);
    loadData();
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Memuat...</div>;

  const LECTURE_TYPES = [
    { value: "video", label: "Video" },
    { value: "article", label: "Artikel" },
    { value: "resource", label: "File" },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/instructor/courses" className="text-sm text-indigo-600 hover:text-indigo-500">← Kembali</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Kurikulum: {course?.title || ""}</h1>
        <p className="mt-1 text-sm text-gray-500">Atur bab dan materi kursus Anda</p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section: any, sIdx: number) => (
          <div key={section.id} className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => moveSection(section.id, "up")} disabled={sIdx === 0} className="text-gray-400 hover:text-white disabled:opacity-30">↑</button>
                <button onClick={() => moveSection(section.id, "down")} disabled={sIdx === sections.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30">↓</button>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Bab {sIdx + 1}: {section.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openLectureForm(section.id)} className="text-xs text-indigo-600 hover:text-indigo-500">+ Materi</button>
                <button onClick={() => deleteSection(section.id)} className="text-xs text-red-500 hover:text-red-400">Hapus</button>
                <button onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)} className="text-gray-400">
                  <svg className={`h-4 w-4 transition-transform ${expandedSection === section.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Lectures */}
            {expandedSection === section.id && (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {section.lectures?.map((lec: any, lIdx: number) => (
                  <div key={lec.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <button onClick={() => moveLecture(lec.id, section.id, "up")} disabled={lIdx === 0} className="text-gray-400 hover:text-white disabled:opacity-30 text-xs">↑</button>
                    <button onClick={() => moveLecture(lec.id, section.id, "down")} disabled={lIdx === section.lectures.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30 text-xs">↓</button>
                    <span className={`w-4 h-4 rounded ${lec.type === "video" ? "text-indigo-400" : lec.type === "article" ? "text-green-400" : "text-orange-400"}`}>
                      {lec.type === "video" ? "▶" : lec.type === "article" ? "📄" : "📎"}
                    </span>
                    <span className="flex-1 text-gray-700 dark:text-gray-300">{lec.title}</span>
                    <button onClick={() => toggleFreePreview(lec.id, lec.is_free_preview)} className={`text-xs px-1.5 py-0.5 rounded ${lec.is_free_preview ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "text-gray-400"}`}>
                      {lec.is_free_preview ? "Gratis" : "Berbayar"}
                    </button>
                    <button onClick={() => openLectureForm(section.id, lec)} className="text-xs text-indigo-500 hover:text-indigo-400">Edit</button>
                    <button onClick={() => deleteLecture(lec.id)} className="text-xs text-red-500 hover:text-red-400">Hapus</button>
                  </div>
                ))}

                {/* Add lecture form */}
                {showLectureForm === section.id && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/30 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Judul materi" value={lectureForm.title}
                        onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                        className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
                      <select value={lectureForm.type} onChange={(e) => setLectureForm({ ...lectureForm, type: e.target.value })}
                        className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
                        {LECTURE_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                      </select>
                    </div>
                    {lectureForm.type === "video" && (
                      <div className="grid grid-cols-2 gap-3">
                        <input type="url" placeholder="URL Video" value={lectureForm.video_url}
                          onChange={(e) => setLectureForm({ ...lectureForm, video_url: e.target.value })}
                          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm col-span-2" />
                        <input type="number" placeholder="Durasi (detik)" value={lectureForm.video_duration}
                          onChange={(e) => setLectureForm({ ...lectureForm, video_duration: parseInt(e.target.value) || 0 })}
                          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
                      </div>
                    )}
                    {lectureForm.type === "article" && (
                      <textarea rows={4} placeholder="Konten artikel (HTML)" value={lectureForm.article_content}
                        onChange={(e) => setLectureForm({ ...lectureForm, article_content: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-mono" />
                    )}
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <input type="checkbox" checked={lectureForm.is_free_preview}
                        onChange={(e) => setLectureForm({ ...lectureForm, is_free_preview: e.target.checked })} />
                      Gratis / Preview
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => addLecture(section.id)} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500">Tambah</button>
                      <button onClick={() => setShowLectureForm(null)} className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400">Batal</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add section */}
      <div className="mt-4 flex gap-2">
        <input type="text" placeholder="Nama bab baru..." value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addSection(); }}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm" />
        <button onClick={addSection} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">+ Tambah Bab</button>
      </div>

      <div className="mt-8 flex justify-between pb-8">
        <Link href={`/instructor/courses/${courseId}/edit`} className="rounded-lg border border-gray-300 dark:border-gray-700 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
          Edit Informasi Kursus
        </Link>
        <Link href="/instructor/courses" className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
          Selesai
        </Link>
      </div>
    </div>
  );
}
