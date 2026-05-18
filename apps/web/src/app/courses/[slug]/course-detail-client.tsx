"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

interface CourseDetailClientProps {
  course: any;
  thumbnailUrl: string | null;
  sections: any[];
  reviews: any[];
}

export function CourseDetailClient({
  course,
  thumbnailUrl,
  sections,
  reviews,
}: CourseDetailClientProps) {
  const { data: session } = useSession();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.length > 0 ? [sections[0]?.id] : [])
  );
  const [showPreview, setShowPreview] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const totalLectures = sections.reduce(
    (sum: number, section: any) => sum + (section.lectures?.length || 0),
    0
  );
  const freeLectures = sections.reduce(
    (sum: number, section: any) =>
      sum + (section.lectures?.filter((l: any) => l.is_free_preview)?.length || 0),
    0
  );

  const totalDuration = sections.reduce(
    (sum: number, section: any) =>
      sum +
      (section.lectures?.reduce(
        (s: number, l: any) => s + (l.video_duration || 0),
        0
      ) || 0),
    0
  );

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}d`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hrs}j ${rem}m`;
  }

  const averageRating = course.average_rating || 0;
  const ratingCount = reviews.length;

  return (
    <>
      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Left: Info */}
            <div className="flex-1">
              <p className="text-sm text-indigo-300">
                {course.category_expand?.name || "Kursus"}
              </p>
              <h1 className="mt-2 text-3xl font-bold">{course.title}</h1>
              {course.subtitle && (
                <p className="mt-2 text-lg text-gray-300">{course.subtitle}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-300">
                <div className="flex items-center">
                  <span className="font-semibold text-yellow-400">
                    {averageRating.toFixed(1)}
                  </span>
                  <div className="ml-1 flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(averageRating)
                            ? "text-yellow-400"
                            : "text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1 text-gray-400">({ratingCount})</span>
                </div>
                <span className="text-gray-500">|</span>
                <span>{course.total_students || 0} siswa</span>
                <span className="text-gray-500">|</span>
                <span>{totalLectures} materi</span>
                <span className="text-gray-500">|</span>
                <span>{formatDuration(totalDuration)}</span>
                {course.level && (
                  <>
                    <span className="text-gray-500">|</span>
                    <span className="capitalize">{course.level === "all" ? "Semua Level" : course.level}</span>
                  </>
                )}
              </div>

              {/* Instructor */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold">
                  {course.instructor_expand?.name?.[0] || "I"}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {course.instructor_name || course.instructor_expand?.name || "Instruktur"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Thumbnail + Price (Mobile: below, Desktop: sidebar) */}
            <div className="lg:w-80">
              <div className="overflow-hidden rounded-xl bg-gray-800">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={course.title}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    <svg className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  {course.discount_price ? (
                    <>
                      <p className="text-3xl font-bold">Rp{course.discount_price.toLocaleString("id-ID")}</p>
                      <p className="text-sm text-gray-400 line-through">Rp{course.price.toLocaleString("id-ID")}</p>
                    </>
                  ) : course.price > 0 ? (
                    <p className="text-3xl font-bold">Rp{course.price.toLocaleString("id-ID")}</p>
                  ) : (
                    <p className="text-3xl font-bold text-green-400">Gratis</p>
                  )}

                  {session ? (
                    <Link
                      href={`/checkout/${course.id}`}
                      className="mt-3 block w-full rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                    >
                      {course.price === 0 ? "Daftar Sekarang" : "Beli Sekarang"}
                    </Link>
                  ) : (
                    <Link
                      href={`/auth/login?callbackUrl=/courses/${course.slug || course.id}`}
                      className="mt-3 block w-full rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                    >
                      Masuk untuk Mendaftar
                    </Link>
                  )}

                  {freeLectures > 0 && (
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="mt-2 block w-full rounded-lg border border-gray-600 px-4 py-2 text-center text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      {showPreview ? "Tutup Preview" : `Preview Gratis (${freeLectures})`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column */}
          <div className="flex-1 space-y-8">
            {/* What You'll Learn */}
            {course.what_you_will_learn && (
              <section className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Yang Akan Dipelajari</h2>
                <div
                  className="mt-3 text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: course.what_you_will_learn }}
                />
              </section>
            )}

            {/* Curriculum */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Kurikulum Kursus
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {sections.length} bab &middot; {totalLectures} materi &middot; {formatDuration(totalDuration)}
              </p>

              <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {sectionsWithLectures(sections).map((section: any) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center justify-between bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {section.title}
                        </span>
                        {section.lectures && (
                          <span className="ml-2 text-xs text-gray-500">
                            {section.lectures.length} materi
                          </span>
                        )}
                      </div>
                      <svg
                        className={`h-5 w-5 text-gray-400 transition-transform ${
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
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {section.lectures.map((lecture: any) => (
                          <div
                            key={lecture.id}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm"
                          >
                            {/* Icon by type */}
                            {lecture.type === "video" ? (
                              <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                              </svg>
                            ) : lecture.type === "article" ? (
                              <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                            ) : lecture.type === "quiz" ? (
                              <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                              </svg>
                            )}

                            <span className="flex-1 text-gray-700 dark:text-gray-300">
                              {lecture.title}
                            </span>

                            {lecture.is_free_preview && (
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">Gratis</span>
                            )}

                            <span className="text-xs text-gray-400">
                              {lecture.video_duration ? formatDuration(lecture.video_duration) : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Requirements */}
            {course.requirements && (
              <section className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Prasyarat</h2>
                <div
                  className="mt-3 text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: course.requirements }}
                />
              </section>
            )}

            {/* Description */}
            {course.description && (
              <section className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Deskripsi</h2>
                <div
                  className="mt-3 text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </section>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Ulasan & Rating
                </h2>
                <div className="mt-4 space-y-4">
                  {reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          {review.student_expand?.name?.[0] || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {review.student_expand?.name || "User"}
                          </p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar (spacer for desktop) */}
          <div className="hidden lg:block lg:w-80" />
        </div>
      </div>
    </>
  );
}

// Helper to process sections with lectures
function sectionsWithLectures(sections: any[]) {
  return sections;
}
