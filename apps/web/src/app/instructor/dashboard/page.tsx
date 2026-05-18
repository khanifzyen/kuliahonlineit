import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { Navbar } from "@/components/navbar";
import { checkInstructor, formatCurrency } from "@/lib/instructor";
import { getLectureEngagement } from "@/lib/analytics";
import Link from "next/link";

const PB = process.env.POCKETBASE_URL || "http://localhost:8090";

async function getStats(userId: string) {
  const empty = { students: 0, revenue: 0, rating: 0, courses: 0, reviews: [] as any[], unanswered: [] as any[], recentCourses: [] as any[], monthlyRevenue: [] as { month: string; total: number }[], courseStats: [] as any[] };
  try {
    const [coursesRes, reviewsRes, qaRes, txRes] = await Promise.all([
      fetch(`${PB}/api/collections/courses/records?filter=${encodeURIComponent(`instructor="${userId}"`)}&sort=-created&perPage=50`, { cache: "no-store" }),
      fetch(`${PB}/api/collections/reviews/records?filter=${encodeURIComponent(`course.instructor="${userId}"`)}&sort=-created&expand=course,student&perPage=5`, { cache: "no-store" }),
      fetch(`${PB}/api/collections/qa_threads/records?filter=${encodeURIComponent(`course.instructor="${userId}" && is_resolved=false`)}&sort=-created&expand=course,student&perPage=5`, { cache: "no-store" }),
      fetch(`${PB}/api/collections/transactions/records?sort=-created&perPage=200`, { cache: "no-store" }),
    ]);

    const courses = coursesRes.ok ? (await coursesRes.json()).items || [] : [];
    const reviews = reviewsRes.ok ? (await reviewsRes.json()).items || [] : [];
    const unanswered = qaRes.ok ? (await qaRes.json()).items || [] : [];
    const allTx = txRes.ok ? (await txRes.json()).items || [] : [];

    // Filter transactions for instructor's courses
    const courseIds = new Set(courses.map((c: any) => c.id));
    const instructorTx = allTx.filter((tx: any) => courseIds.has(tx.course));

    let totalStudents = 0;
    let totalRevenue = 0;
    let totalRating = 0;
    let ratingCount = 0;

    const courseStats = courses.map((c: any) => {
      const courseTx = instructorTx.filter((tx: any) => tx.course === c.id && tx.status === "success");
      const revenue = courseTx.reduce((sum: number, tx: any) => sum + (tx.total || 0), 0);
      const enrolls = c.total_students || 0;
      totalStudents += enrolls;
      totalRevenue += revenue;
      if (c.average_rating > 0) { totalRating += c.average_rating; ratingCount++; }
      return { id: c.id, title: c.title, enrolls, revenue, rating: c.average_rating || 0, status: c.status };
    });

    // Monthly revenue (last 6 months)
    const monthlyMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = 0;
    }
    for (const tx of instructorTx) {
      if (tx.status === "success") {
        const d = new Date(tx.created);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyMap[key] !== undefined) monthlyMap[key] += tx.total || 0;
      }
    }
    const monthlyRevenue = Object.entries(monthlyMap).map(([month, total]) => ({ month, total }));

    return {
      students: totalStudents,
      revenue: totalRevenue,
      rating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0.0",
      courses: courses.length,
      reviews,
      unanswered,
      recentCourses: courses.slice(0, 5),
      monthlyRevenue,
      courseStats: courseStats.sort((a: any, b: any) => b.enrolls - a.enrolls),
    };
  } catch { return empty; }
}

export default async function InstructorDashboardPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login?callbackUrl=/instructor/dashboard");

  const isInstructor = await checkInstructor(user.id);
  if (!isInstructor) redirect("/");

  const stats = await getStats(user.id);
  const engagement = await getLectureEngagement(user.id);

  const maxRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.total), 1);

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
          {/* Revenue Chart */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pendapatan 6 Bulan</h2>
            {stats.monthlyRevenue.length > 0 ? (
              <div className="flex items-end gap-2 h-40">
                {stats.monthlyRevenue.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400">{m.total > 0 ? formatCurrency(m.total).replace("Rp", "") : ""}</span>
                    <div
                      className="w-full bg-indigo-500 rounded-t transition-all"
                      style={{ height: `${Math.max((m.total / maxRevenue) * 100, 4)}%` }}
                    />
                    <span className="text-[10px] text-gray-500">{m.month.slice(5)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Belum ada data pendapatan.</p>
            )}
          </section>

          {/* Course Performance Table */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Performansi Kursus</h2>
            {stats.courseStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 font-medium text-gray-500">Kursus</th>
                      <th className="text-center py-2 font-medium text-gray-500">Siswa</th>
                      <th className="text-center py-2 font-medium text-gray-500">Rating</th>
                      <th className="text-right py-2 font-medium text-gray-500">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.courseStats.map((c: any) => (
                      <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800/50">
                        <td className="py-2 text-gray-900 dark:text-white truncate max-w-[200px]">{c.title}</td>
                        <td className="py-2 text-center text-gray-500">{c.enrolls}</td>
                        <td className="py-2 text-center text-yellow-500">{c.rating > 0 ? c.rating.toFixed(1) : "—"}</td>
                        <td className="py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(c.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Belum ada data kursus.</p>
            )}
          </section>

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
                    <p className="text-xs text-gray-500 mt-1">{q.expand?.student?.name || "User"} &middot; &ldquo;{q.expand?.course?.title || "-"}&rdquo;</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Semua pertanyaan sudah terjawab ✅</p>
            )}
          </section>

          {/* Lecture Engagement */}
          <section className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Engagement Materi</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Total Watch Time</span><p className="text-lg font-bold">{(engagement.totalWatchTime / 3600).toFixed(1)} jam</p></div>
              <div><span className="text-gray-500">Rata-rata per Materi</span><p className="text-lg font-bold">{Math.round(engagement.avgWatchTimePerLecture / 60)} menit</p></div>
              <div><span className="text-gray-500">Materi Terselesaikan</span><p className="text-lg font-bold">{engagement.watchedLectures} dari {engagement.totalProgress}</p></div>
              <div><span className="text-gray-500">Total Enrollment</span><p className="text-lg font-bold">{engagement.totalEnrollments}</p></div>
            </div>
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
              <a href="/api/export" download className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <span className="text-lg">📥</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export CSV</span>
              </a>
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
