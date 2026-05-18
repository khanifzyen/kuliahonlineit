import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { Navbar } from "@/components/navbar";
import { checkInstructor, formatCurrency } from "@/lib/instructor";
import Link from "next/link";

const PB = process.env.POCKETBASE_URL || "http://localhost:8090";

async function getStats(userId: string) {
  const empty = { students: 0, revenue: 0, rating: 0, courses: 0, reviews: [] as any[], unanswered: [] as any[], recentCourses: [] as any[] };
  try {
    const [coursesRes, reviewsRes, qaRes] = await Promise.all([
      fetch(`${PB}/api/collections/courses/records?filter=${encodeURIComponent(`instructor="${userId}"`)}&sort=-created&perPage=10`, { cache: "no-store" }),
      fetch(`${PB}/api/collections/reviews/records?filter=${encodeURIComponent(`course.instructor="${userId}"`)}&sort=-created&expand=course,student&perPage=5`, { cache: "no-store" }),
      fetch(`${PB}/api/collections/qa_threads/records?filter=${encodeURIComponent(`course.instructor="${userId}" && is_resolved=false`)}&sort=-created&expand=course,student&perPage=5`, { cache: "no-store" }),
    ]);

    const courses = coursesRes.ok ? (await coursesRes.json()).items || [] : [];
    const reviews = reviewsRes.ok ? (await reviewsRes.json()).items || [] : [];
    const unanswered = qaRes.ok ? (await qaRes.json()).items || [] : [];

    // Hitung total students (unique dari enrollments via courses)
    let totalStudents = 0;
    let totalRevenue = 0;
    let totalRating = 0;
    let ratingCount = 0;

    for (const c of courses) {
      totalStudents += c.total_students || 0;
      if (c.average_rating > 0) { totalRating += c.average_rating; ratingCount++; }
      // Revenue: sum of transactions for this course (simplified)
    }

    return {
      students: totalStudents,
      revenue: totalRevenue,
      rating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0.0",
      courses: courses.length,
      reviews,
      unanswered,
      recentCourses: courses.slice(0, 5),
    };
  } catch { return empty; }
}

export default async function InstructorDashboardPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login?callbackUrl=/instructor/dashboard");

  const isInstructor = await checkInstructor(user.id);
  if (!isInstructor) redirect("/");

  const stats = await getStats(user.id);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Selamat datang, {user.name}</p>

        {/* Overview Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Siswa" value={stats.students} icon="👥" />
          <StatCard label="Total Kursus" value={stats.courses} icon="📚" />
          <StatCard label="Rating Rata-rata" value={stats.rating} icon="⭐" />
          <StatCard label="Pendapatan" value={stats.revenue > 0 ? formatCurrency(stats.revenue) : "Rp0"} icon="💰" />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Kursus Saya */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kursus Saya</h2>
              <Link href="/instructor/courses/new" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">
                + Kursus Baru
              </Link>
            </div>
            {stats.recentCourses.length > 0 ? (
              <div className="space-y-2">
                {stats.recentCourses.map((c: any) => (
                  <Link key={c.id} href={`/instructor/courses/${c.id}/edit`} className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.total_students || 0} siswa &middot; Rp{(c.discount_price || c.price || 0).toLocaleString("id-ID")}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      c.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      c.status === "draft" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}>{c.status}</span>
                  </Link>
                ))}
                <Link href="/instructor/courses" className="block text-center text-sm text-indigo-600 hover:text-indigo-500 pt-2">Lihat semua kursus →</Link>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Belum ada kursus. Buat kursus pertama Anda!</p>
            )}
          </section>

          {/* Recent Q&A */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pertanyaan Belum Terjawab</h2>
            {stats.unanswered.length > 0 ? (
              <div className="space-y-2">
                {stats.unanswered.map((q: any) => (
                  <div key={q.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{q.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{q.expand?.student?.name || "User"} &middot; dari kursus "{q.expand?.course?.title || "-"}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Semua pertanyaan sudah terjawab ✅</p>
            )}
          </section>

          {/* Recent Reviews */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ulasan Terbaru</h2>
            {stats.reviews.length > 0 ? (
              <div className="space-y-2">
                {stats.reviews.map((r: any) => (
                  <div key={r.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span className="text-xs text-gray-500">{r.expand?.student?.name || "User"}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{r.comment || "—"}</p>
                    <p className="text-xs text-gray-400 mt-1">Kursus: {r.expand?.course?.title || "-"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Belum ada ulasan.</p>
            )}
          </section>

          {/* Quick Links */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Menu Cepat</h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickLink href="/instructor/courses" label="Kelola Kursus" icon="📝" />
              <QuickLink href="/instructor/coupons" label="Kupon Diskon" icon="🏷️" />
              <QuickLink href="/instructor/courses/new" label="Buat Kursus" icon="➕" />
              <QuickLink href="/courses" label="Lihat Frontend" icon="👁️" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50">
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </Link>
  );
}
