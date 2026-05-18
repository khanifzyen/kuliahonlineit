import Link from "next/link";
import { Navbar } from "@/components/navbar";

async function getCategories() {
  try {
    const res = await fetch(
      `${process.env.POCKETBASE_URL || "http://localhost:8090"}/api/collections/categories/records?sort=sort_order&perPage=10`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

async function getFeaturedCourses() {
  try {
    const res = await fetch(
      `${process.env.POCKETBASE_URL || "http://localhost:8090"}/api/collections/courses/records?filter=status%3D%22published%22+%26%26+is_featured%3Dtrue&sort=-total_students&perPage=8`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const [categories, featuredCourses] = await Promise.all([
    getCategories(),
    getFeaturedCourses(),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              Belajar Apapun,
              <span className="text-indigo-600 dark:text-indigo-400"> Kapanpun, Di manapun</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Ribuan kursus online dari instruktur profesional. Tingkatkan skill-mu
              dan raih karir impian bersama KuliahOnlineIT.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Mulai Belajar Gratis
              </Link>
              <Link
                href="/courses"
                className="rounded-xl border border-gray-300 dark:border-gray-700 px-8 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Jelajahi Kursus
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative blob */}
        <div className="absolute -top-40 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-200/30 dark:bg-indigo-800/10 blur-3xl" />
        <div className="absolute -bottom-40 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-200/20 dark:bg-purple-800/10 blur-3xl" />
      </section>

      {/* Kategori Section */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kategori Populer
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/courses?category=${cat.slug}`}
                className="flex flex-col items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
              >
                <span className="text-3xl">{cat.icon || "📚"}</span>
                <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Kursus Unggulan */}
      {featuredCourses.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Kursus Unggulan
            </h2>
            <Link
              href="/courses"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Lihat Semua &rarr;
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredCourses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 px-6 py-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} KuliahOnlineIT. All rights reserved.
      </footer>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
  const thumbnailUrl = course.thumbnail
    ? `${pbUrl}/api/files/courses/${course.id}/${course.thumbnail}`
    : null;

  return (
    <Link
      href={`/courses/${course.slug || course.id}`}
      className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-600">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {course.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {course.instructor_name || "Instruktur"}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center">
            <span className="text-xs font-semibold text-yellow-500">{course.average_rating || "0.0"}</span>
            <svg className="ml-0.5 h-3.5 w-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-xs text-gray-400">({course.total_students || 0})</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {course.discount_price ? (
            <>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Rp{course.discount_price.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-gray-400 line-through">
                Rp{course.price.toLocaleString("id-ID")}
              </span>
            </>
          ) : course.price > 0 ? (
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              Rp{course.price.toLocaleString("id-ID")}
            </span>
          ) : (
            <span className="text-sm font-bold text-green-600">Gratis</span>
          )}
        </div>
      </div>
    </Link>
  );
}
