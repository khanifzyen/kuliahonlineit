// ============================================
// KuliahOnlineIT - Export & Analytics Utilities
// ============================================

const PB = process.env.POCKETBASE_URL || "http://localhost:8090";

export async function exportCourseStatsCSV(instructorId: string): Promise<string> {
  const headers = "Judul,Status,Siswa,Rating,Pendapatan\n";
  try {
    const res = await fetch(
      PB + "/api/collections/courses/records?filter=" + encodeURIComponent('instructor="' + instructorId + '"') + "&perPage=50",
      { cache: "no-store" }
    );
    if (!res.ok) return headers + "No data";
    const courses = (await res.json()).items || [];

    // Get transactions for revenue
    const txRes = await fetch(PB + "/api/collections/transactions/records?perPage=200", { cache: "no-store" });
    const allTx = txRes.ok ? (await txRes.json()).items || [] : [];

    const rows = courses.map((c: any) => {
      const revenue = allTx
        .filter((tx: any) => tx.course === c.id && tx.status === "success")
        .reduce((s: number, tx: any) => s + (tx.total || 0), 0);
      return [c.title, c.status, c.total_students || 0, c.average_rating || 0, revenue].join(",");
    });

    return headers + rows.join("\n");
  } catch {
    return headers + "Error fetching data";
  }
}

export async function getLectureEngagement(instructorId: string) {
  try {
    const coursesRes = await fetch(
      PB + "/api/collections/courses/records?filter=" + encodeURIComponent('instructor="' + instructorId + '"') + "&perPage=50",
      { cache: "no-store" }
    );
    if (!coursesRes.ok) return { totalWatchTime: 0, avgWatchTimePerLecture: 0, totalEnrollments: 0 };
    const courses = (await coursesRes.json()).items || [];
    const courseIds = courses.map((c: any) => c.id);

    // Count enrollments
    const enrollRes = await fetch(PB + "/api/collections/enrollments/records?perPage=200", { cache: "no-store" });
    const enrollments = enrollRes.ok ? (await enrollRes.json()).items || [] : [];
    const totalEnrollments = enrollments.filter((e: any) => courseIds.includes(e.course)).length;

    // Aggregate watch time from lecture_progress
    const progRes = await fetch(PB + "/api/collections/lecture_progress/records?perPage=500", { cache: "no-store" });
    const progress = progRes.ok ? (await progRes.json()).items || [] : [];
    const totalWatchTime = progress.reduce((s: number, p: any) => s + (p.watch_time || 0), 0);
    const watchedLectures = progress.filter((p: any) => p.completed).length;

    return {
      totalWatchTime,
      avgWatchTimePerLecture: progress.length > 0 ? Math.round(totalWatchTime / progress.length) : 0,
      watchedLectures,
      totalProgress: progress.length,
      totalEnrollments,
    };
  } catch {
    return { totalWatchTime: 0, avgWatchTimePerLecture: 0, watchedLectures: 0, totalProgress: 0, totalEnrollments: 0 };
  }
}
