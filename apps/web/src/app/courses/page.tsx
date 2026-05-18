import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { SearchFilter } from "./search-filter";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    level?: string;
    price?: string;
    sort?: string;
    q?: string;
    page?: string;
  }>;
}

async function getCategories() {
  try {
    const res = await fetch(
      `${process.env.POCKETBASE_URL || "http://localhost:8090"}/api/collections/categories/records?sort=sort_order&perPage=20`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

async function getCourses(params: Record<string, string>) {
  try {
    const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
    const filterParts: string[] = ['status="published"'];

    if (params.category) {
      // Find category id by slug
      const catRes = await fetch(
        `${pbUrl}/api/collections/categories/records?filter=${encodeURIComponent(`slug="${params.category}"`)}&perPage=1`,
        { cache: "no-store" }
      );
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.items?.[0]) {
          filterParts.push(`category="${catData.items[0].id}"`);
        }
      }
    }

    if (params.level && params.level !== "all") {
      filterParts.push(`level="${params.level}"`);
    }

    if (params.price === "free") {
      filterParts.push("price=0");
    } else if (params.price === "paid") {
      filterParts.push("price>0");
    }

    let sort = "-created";
    if (params.sort === "popular") sort = "-total_students";
    else if (params.sort === "rating") sort = "-average_rating";
    else if (params.sort === "price_asc") sort = "price";
    else if (params.sort === "price_desc") sort = "-price";
    else if (params.sort === "oldest") sort = "created";

    const filter = filterParts.join(" && ");
    const page = parseInt(params.page || "1");
    const perPage = 12;

    const url = `${pbUrl}/api/collections/courses/records?filter=${encodeURIComponent(filter)}&sort=${sort}&page=${page}&perPage=${perPage}&expand=category`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { items: [], totalPages: 1, page: 1 };
    const data = await res.json();
    return {
      items: data.items || [],
      totalPages: data.totalPages || 1,
      page: data.page || 1,
    };
  } catch {
    return { items: [], totalPages: 1, page: 1 };
  }
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [categories, courseData] = await Promise.all([
    getCategories(),
    getCourses({
      category: params.category || "",
      level: params.level || "",
      price: params.price || "",
      sort: params.sort || "",
      q: params.q || "",
      page: params.page || "1",
    }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Jelajahi Kursus
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Temukan kursus yang sesuai dengan minat Anda
        </p>

        <SearchFilter categories={categories} currentParams={params} />

        {/* Course Grid */}
        {courseData.items.length > 0 ? (
          <>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {courseData.items.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {courseData.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: Math.min(courseData.totalPages, 10) }, (_, i) => i + 1).map((p) => {
                  const newParams = new URLSearchParams(params as any);
                  newParams.set("page", String(p));
                  return (
                    <Link
                      key={p}
                      href={`/courses?${newParams.toString()}`}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        p === courseData.page
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Tidak ada kursus yang ditemukan</p>
            <Link href="/courses" className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-500">
              Reset filter
            </Link>
          </div>
        )}
      </div>
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
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500">{course.instructor_name || "Instruktur"}</p>
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs font-semibold text-yellow-500">{course.average_rating || "0.0"}</span>
          <svg className="h-3.5 w-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="ml-1 text-xs text-gray-400">({course.total_students || 0})</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {course.discount_price ? (
            <>
              <span className="text-sm font-bold text-gray-900">Rp{course.discount_price.toLocaleString("id-ID")}</span>
              <span className="text-xs text-gray-400 line-through">Rp{course.price.toLocaleString("id-ID")}</span>
            </>
          ) : course.price > 0 ? (
            <span className="text-sm font-bold text-gray-900">Rp{course.price.toLocaleString("id-ID")}</span>
          ) : (
            <span className="text-sm font-bold text-green-600">Gratis</span>
          )}
        </div>
      </div>
    </Link>
  );
}
