"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

interface ReviewFormProps {
  courseId: string;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ courseId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Pilih rating terlebih dahulu"); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${POCKETBASE_URL}/api/collections/reviews/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: courseId, student: user!.id, rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data?.data?.message || "";
        if (msg.includes("unique") || res.status === 400) {
          setError("Anda sudah memberikan review untuk kursus ini");
        } else {
          setError("Gagal mengirim review");
        }
      } else {
        setSuccess(true);
        setRating(0);
        setComment("");
        setTimeout(() => { setSuccess(false); onReviewSubmitted(); }, 2000);
      }
    } catch {
      setError("Gagal mengirim review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-500">✅ Review berhasil dikirim!</p>}

      {/* Star rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-colors"
            >
              <svg
                className={`h-7 w-7 ${
                  star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Komentar (opsional)</label>
        <textarea
          id="review-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bagikan pengalaman Anda mengikuti kursus ini..."
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Mengirim..." : "Kirim Review"}
      </button>
    </form>
  );
}
