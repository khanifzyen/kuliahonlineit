"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

interface QAThread {
  id: string;
  title: string;
  content: string;
  is_resolved: boolean;
  created: string;
  student: string;
  expand?: { student?: { name: string }; lecture?: { title: string } };
  _answers?: QAAnswer[];
}

interface QAAnswer {
  id: string;
  content: string;
  is_instructor_reply: boolean;
  created: string;
  user: string;
  expand?: { user?: { name: string } };
}

export function QASection({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<QAThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [filter, setFilter] = useState<"all" | "unanswered" | "resolved">("all");

  const loadThreads = useCallback(async () => {
    setLoading(true);
    try {
      let filterStr = `course="${courseId}"`;
      if (filter === "resolved") filterStr += ` && is_resolved=true`;
      else if (filter === "unanswered") filterStr += ` && is_resolved=false`;

      const res = await fetch(
        `${POCKETBASE_URL}/api/collections/qa_threads/records?filter=${encodeURIComponent(filterStr)}&sort=-created&expand=student&perPage=30`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setThreads(data.items || []);
      }
    } catch {} finally { setLoading(false); }
  }, [courseId, filter]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newTitle.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${POCKETBASE_URL}/api/collections/qa_threads/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: courseId, student: user.id, title: newTitle, content: newContent }),
      });
      setNewTitle(""); setNewContent(""); setShowForm(false);
      loadThreads();
    } catch {} finally { setSubmitting(false); }
  }

  async function handleAddAnswer(threadId: string) {
    if (!user || !answerText.trim()) return;
    try {
      await fetch(`${POCKETBASE_URL}/api/collections/qa_answers/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread: threadId, user: user.id, content: answerText, is_instructor_reply: false }),
      });
      setAnswerText("");
      loadThreads();
    } catch {}
  }

  async function loadAnswers(threadId: string) {
    try {
      const res = await fetch(
        `${POCKETBASE_URL}/api/collections/qa_answers/records?filter=${encodeURIComponent(`thread="${threadId}"`)}&sort=created&expand=user&perPage=20`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, _answers: data.items || [] } : t)));
      }
    } catch {}
  }

  function toggleThread(id: string) {
    if (expandedThread === id) { setExpandedThread(null); }
    else { setExpandedThread(id); loadAnswers(id); }
  }

  async function toggleResolved(thread: QAThread) {
    try {
      await fetch(`${POCKETBASE_URL}/api/collections/qa_threads/records/${thread.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_resolved: !thread.is_resolved }),
      });
      loadThreads();
    } catch {}
  }

  const FILTERS: { key: "all" | "unanswered" | "resolved"; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "unanswered", label: "Belum Terjawab" },
    { key: "resolved", label: "Terjawab" },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tanya Jawab</h2>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            {showForm ? "Batal" : "+ Pertanyaan Baru"}
          </button>
        )}
      </div>

      {/* Filter buttons */}
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* New thread form */}
      {showForm && (
        <form onSubmit={handleCreateThread} className="mb-4 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <input
            type="text" placeholder="Judul pertanyaan" required
            value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <textarea
            rows={3} placeholder="Tulis pertanyaan Anda..."
            value={newContent} onChange={(e) => setNewContent(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {submitting ? "Mengirim..." : "Kirim Pertanyaan"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Memuat...</p>
      ) : threads.length === 0 ? (
        <p className="text-sm text-gray-400">
          {filter === "all" ? "Belum ada pertanyaan." : filter === "unanswered" ? "Semua pertanyaan sudah terjawab." : "Belum ada pertanyaan yang ditandai selesai."}
        </p>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <div key={thread.id} className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <button
                onClick={() => toggleThread(thread.id)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{thread.title}</span>
                    {thread.is_resolved && <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-1.5 py-0.5 rounded">Terjawab</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{thread.expand?.student?.name || "User"} &middot; {new Date(thread.created).toLocaleDateString("id-ID")}</p>
                </div>
                <svg className={`h-5 w-5 text-gray-400 transition-transform ${expandedThread === thread.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {expandedThread === thread.id && (
                <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{thread.content}</div>

                  {thread._answers?.map((answer) => (
                    <div key={answer.id} className={`rounded-lg p-3 ${answer.is_instructor_reply ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800" : "bg-gray-50 dark:bg-gray-900"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{answer.expand?.user?.name || "User"}</span>
                        {answer.is_instructor_reply && <span className="text-[10px] text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 px-1.5 py-0.5 rounded">Instructor</span>}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{answer.content}</p>
                    </div>
                  ))}

                  {user && (
                    <div className="flex gap-2">
                      <input
                        type="text" placeholder="Tulis jawaban..." value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <button onClick={() => handleAddAnswer(thread.id)} className="rounded-lg bg-gray-800 px-3 py-2 text-xs font-medium text-white hover:bg-gray-700">Jawab</button>
                    </div>
                  )}

                  {user && user.id === thread.student && !thread.is_resolved && (
                    <button onClick={() => toggleResolved(thread)} className="text-xs text-green-600 hover:text-green-500">Tandai sudah terjawab</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
