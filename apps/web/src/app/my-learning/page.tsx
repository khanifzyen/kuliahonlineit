import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

async function getEnrollments(userId: string) {
  try {
    const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
    const res = await fetch(
      `${pbUrl}/api/collections/enrollments/records?filter=${encodeURIComponent(`student="${userId}"`)}&sort=-created&expand=course&perPage=20`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export default async function MyLearningPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/my-learning");
  }

  const userId = (session.user as any).id || (session.user as any).pocketbaseId;
  const enrollments = await getEnrollments(userId);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Learning</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kursus yang sudah Anda daftar
        </p>

        {enrollments.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {enrollments.map((enrollment: any) => {
              const course = enrollment.expand?.course;
              if (!course) return null;

              const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
              const thumbnailUrl = course.thumbnail
                ? `${pbUrl}/api/files/courses/${course.id}/${course.thumbnail}`
                : null;
              const progress = enrollment.progress || 0;

              return (
                <Link
                  key={enrollment.id}
                  href={`/my-learning/${course.id}`}
                  className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={course.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    )}
                    {/* Progress overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500">{Math.round(progress)}% selesai</span>
                    </div>
                    <button className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
                      {progress === 100 ? "Lihat Sertifikat" : "Lanjut Belajar"}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Belum ada kursus</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Anda belum mendaftar kursus apapun. Mulai belajar sekarang!
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Jelajahi Kursus
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
