"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

interface CoursePlayerClientProps {
  course: any;
  sections: any[];
  progress: Record<string, any>;
  enrollment: any;
}

export function CoursePlayerClient({
  course,
  sections,
  progress: initialProgress,
  enrollment,
}: CoursePlayerClientProps) {
  const [activeLecture, setActiveLecture] = useState<any>(null);
  const [progress, setProgress] = useState(initialProgress);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.length > 0 ? [sections[0]?.id] : [])
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Set first lecture as active on mount
  useEffect(() => {
    if (!activeLecture && sections.length > 0) {
      const firstLecture = sections[0]?.lectures?.[0];
      if (firstLecture) setActiveLecture(firstLecture);
    }
  }, [sections, activeLecture]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const selectLecture = useCallback(
    (lecture: any) => {
      setActiveLecture(lecture);
      // Auto-expand the section containing this lecture
      for (const section of sections) {
        if (section.lectures?.some((l: any) => l.id === lecture.id)) {
          setExpandedSections((prev) => new Set([...prev, section.id]));
          break;
        }
      }
    },
    [sections]
  );

  const markComplete = useCallback(async () => {
    if (!activeLecture || !enrollment) return;

    try {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";
      const existing = progress[activeLecture.id];

      if (existing) {
        // Update existing progress
        await fetch(`${pbUrl}/api/collections/lecture_progress/records/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: true }),
        });
      } else {
        // Create new progress
        const res = await fetch(`${pbUrl}/api/collections/lecture_progress/records`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student: enrollment.student,
            lecture: activeLecture.id,
            enrollment: enrollment.id,
            completed: true,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setProgress((prev: any) => ({ ...prev, [activeLecture.id]: data }));
        }
      }
    } catch (err) {
      console.error("Failed to mark lecture complete:", err);
    }
  }, [activeLecture, enrollment, progress]);

  const totalLectures = sections.reduce(
    (sum: number, s: any) => sum + (s.lectures?.length || 0),
    0
  );
  const completedLectures = Object.values(progress).filter(
    (p: any) => p.completed
  ).length;
  const overallProgress =
    totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } flex-shrink-0 border-r border-gray-800 bg-gray-900 transition-all duration-300 overflow-hidden`}
      >
        <div className="h-full overflow-y-auto p-4">
          {/* Course Title */}
          <Link
            href={`/courses/${course.slug || course.id}`}
            className="mb-4 block text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            {course.title}
          </Link>

          {/* Progress Summary */}
          <div className="mb-4 rounded-lg bg-gray-800 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-medium">{overallProgress}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {completedLectures} / {totalLectures} materi
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-1">
            {sections.map((section: any) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-200 truncate">
                      {section.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {section.lectures?.length || 0} materi
                    </p>
                  </div>
                  <svg
                    className={`h-4 w-4 flex-shrink-0 text-gray-500 transition-transform ${
                      expandedSections.has(section.id) ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {expandedSections.has(section.id) && section.lectures && (
                  <div className="ml-2 space-y-0.5">
                    {section.lectures.map((lecture: any) => {
                      const prog = progress[lecture.id];
                      const isActive = activeLecture?.id === lecture.id;
                      const isDone = prog?.completed;

                      return (
                        <button
                          key={lecture.id}
                          onClick={() => selectLecture(lecture)}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            isActive
                              ? "bg-indigo-600/20 text-indigo-300"
                              : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                          }`}
                        >
                          {/* Status icon */}
                          {isDone ? (
                            <svg className="h-4 w-4 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : isActive ? (
                            <svg className="h-4 w-4 flex-shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 flex-shrink-0 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                          )}

                          <span className="flex-1 truncate">{lecture.title}</span>

                          {lecture.video_duration > 0 && (
                            <span className="text-xs text-gray-600">
                              {formatDuration(lecture.video_duration)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center gap-4 border-b border-gray-800 px-4 py-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          {activeLecture && (
            <span className="text-sm text-gray-300 truncate">{activeLecture.title}</span>
          )}
        </div>

        {/* Lecture Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {activeLecture ? (
            <div className="w-full max-w-4xl">
              {activeLecture.type === "video" ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {activeLecture.video_url ? (
                    <video
                      ref={videoRef}
                      src={activeLecture.video_url}
                      controls
                      className="h-full w-full"
                      autoPlay
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      <div className="text-center">
                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                        <p className="mt-2 text-sm">Video tidak tersedia</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeLecture.type === "article" ? (
                <div className="rounded-lg bg-gray-900 p-6 text-gray-300 prose prose-invert max-w-none">
                  {activeLecture.article_content ? (
                    <div dangerouslySetInnerHTML={{ __html: activeLecture.article_content }} />
                  ) : (
                    <p className="text-gray-500">Konten artikel belum tersedia.</p>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>Tipe materi &ldquo;{activeLecture.type}&rdquo; belum didukung</p>
                </div>
              )}

              {/* Lecture actions */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{activeLecture.title}</h2>
                  {activeLecture.description && (
                    <p className="mt-1 text-sm text-gray-400">{activeLecture.description}</p>
                  )}
                </div>
                <button
                  onClick={markComplete}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  {progress[activeLecture.id]?.completed ? "✓ Selesai" : "Tandai Selesai"}
                </button>
              </div>

              {/* Resource download */}
              {activeLecture.resource_file && (
                <div className="mt-4 rounded-lg border border-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      <span className="text-sm text-gray-300">File Pendukung</span>
                    </div>
                    <a
                      href={`${pbUrl}/api/files/lectures/${activeLecture.id}/${activeLecture.resource_file}`}
                      download
                      className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="mt-4 text-lg">Pilih materi untuk memulai belajar</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "";
  if (seconds < 60) return `${seconds}d`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}j ${rem}m`;
}
