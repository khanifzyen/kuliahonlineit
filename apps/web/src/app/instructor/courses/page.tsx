import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { Navbar } from "@/components/navbar";
import { checkInstructor } from "@/lib/instructor";
import Link from "next/link";

const PB = process.env.POCKETBASE_URL || "http://localhost:8090";

async function getCourses(userId: string) {
  try {
    const res = await fetch(
      `${PB}/api/collections/courses/records?filter=${encodeURIComponent(`instructor="${userId}"`)}&sort=-updated&expand=category&perPage=50`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch { return []; }
}

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default async function InstructorCoursesPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login?callbackUrl=/instructor/courses");

  const isInstructor = await checkInstructor(user.id);
  if (!isInstructor) redirect("/");

  const courses = await getCourses(user.id);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kursus Saya</h1>
            <p className="mt-1 text-sm text-gray-500">Kelola semua kursus Anda</p>
          </div>
          <Link href="/instructor/courses/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            + Kursus Baru
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="mt-6 space-y-4">
            {courses.map((c: any) => (
              <div key={c.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{c.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status] || ""}`}>{c.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {c.total_students || 0} siswa &middot; Rp{(c.discount_price || c.price || 0).toLocaleString("id-ID")}
                      {c.discount_price && <span className="line-through text-gray-400 ml-1">Rp{c.price.toLocaleString("id-ID")}</span>}
                    </p>
                    {c.expand?.category && <p className="text-xs text-gray-400 mt-0.5">{c.expand.category.name}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/instructor/courses/${c.id}/edit`} className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Edit</Link>
                    <Link href={`/instructor/courses/${c.id}/curriculum`} className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Kurikulum</Link>
                    <Link href={`/courses/${c.slug || c.id}`} className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Lihat</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-gray-500">Belum ada kursus. Buat kursus pertama Anda!</p>
            <Link href="/instructor/courses/new" className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">Buat Kursus Baru</Link>
          </div>
        )}
      </div>
    </div>
  );
}
