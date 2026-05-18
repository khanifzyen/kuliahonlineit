"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const PB = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

interface ReviewFormProps {
  courseId: string;
  onReviewSubmitted: () => void;
  existingReview?: any;
}

export function ReviewForm({ courseId, onReviewSubmitted, existingReview }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isEdit = !!existingReview;

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Pilih rating terlebih dahulu"); return; }
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      const url = isEdit
        ? `${PB}/api/collections/reviews/records/${existingReview.id}`
        : `${PB}/api/collections/reviews/records`;
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? JSON.stringify({ rating, comment })
        : JSON.stringify({ course: courseId, student: user!.id, rating, comment });

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
      if (!res.ok) {
        const data = await res.json();
        const msg = data?.data?.message || "";
        if (msg.includes("unique") || res.status === 400) setError("Anda sudah memberikan review");
        else setError("Gagal " + (isEdit ? "mengupdate" : "mengirim") + " review");
      } else {
        setSuccess(isEdit ? "✅ Review diupdate!" : "✅ Review berhasil dikirim!");
        if (!isEdit) { setRating(0); setComment(""); }
        setTimeout(() => { setSuccess(""); onReviewSubmitted(); }, 2000);
      }
    } catch { setError("Gagal " + (isEdit ? "mengupdate" : "mengirim") + " review"); }
    finally { setSubmitting(false); }
  }

  async function handleDelete() {
    if (!confirm("Hapus review ini?")) return;
    setSubmitting(true);
    try {
      await fetch(`${PB}/api/collections/reviews/records/${existingReview.id}`, { method: "DELETE" });
      setSuccess("✅ Review dihapus!");
      setTimeout(() => { setSuccess(""); onReviewSubmitted(); }, 2000);
    } catch { setError("Gagal menghapus review"); }
    finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-500">{success}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="p-0.5">
              <svg className={`h-7 w-7 ${star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Komentar</label>
        <textarea id="review-comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="Bagikan pengalaman Anda..." className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
          {submitting ? "Memproses..." : isEdit ? "Update Review" : "Kirim Review"}
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={submitting} className="rounded-lg border border-red-300 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
            Hapus
          </button>
        )}
      </div>
    </form>
  );
}
