import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

const PB = process.env.POCKETBASE_URL || "http://localhost:8090";

interface Props { params: Promise<{ courseId: string }> }

async function getCourse(courseId: string) {
  try {
    const res = await fetch(`${PB}/api/collections/courses/records/${courseId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function getStudents(courseId: string) {
  try {
    const res = await fetch(
      `${PB}/api/collections/enrollments/records?filter=${encodeURIComponent(`course="${courseId}"`)}&sort=-created&expand=student&perPage=50`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch { return []; }
}

export default async function StudentsPage({ params }: Props) {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  const { courseId } = await params;
  const course = await getCourse(courseId);
  if (!course) redirect("/instructor/courses");

  const enrollments = await getStudents(courseId);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <Link href="/instructor/courses" className="text-sm text-indigo-600 hover:text-indigo-500">← Kembali</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Siswa: {course.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{enrollments.length} siswa terdaftar</p>

        {enrollments.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Nama</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Progress</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Bergabung</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e: any) => {
                  const s = e.expand?.student;
                  return (
                    <tr key={e.id} className="border-b border-gray-100 dark:border-gray-800/50">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{s?.name || "—"}</td>
                      <td className="py-3 px-4 text-gray-500">{s?.email || "—"}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${e.progress || 0}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{Math.round(e.progress || 0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {e.completed ? (
                          <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full">✅ Selesai</span>
                        ) : (
                          <span className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-0.5 rounded-full">🔄 Aktif</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">{new Date(e.created).toLocaleDateString("id-ID")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-12 text-center text-gray-400">Belum ada siswa yang terdaftar.</div>
        )}
      </div>
    </div>
  );
}
