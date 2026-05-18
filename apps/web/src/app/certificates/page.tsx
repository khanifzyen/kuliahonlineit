import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";

async function getCertificates(userId: string) {
  try {
    const res = await fetch(
      `${POCKETBASE_URL}/api/collections/certificates/records?filter=${encodeURIComponent(`student="${userId}"`)}&sort=-issued_at&expand=course&perPage=20`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export default async function CertificatesPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login?callbackUrl=/certificates");

  const certificates = await getCertificates(user.id);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sertifikat Saya</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sertifikat kelulusan kursus Anda
        </p>

        {certificates.length > 0 ? (
          <div className="mt-6 space-y-4">
            {certificates.map((cert: any) => {
              const course = cert.expand?.course;
              const date = cert.issued_at
                ? new Date(cert.issued_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
                : new Date(cert.created).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });

              return (
                <div key={cert.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Certificate icon */}
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                        <svg className="h-7 w-7 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{course?.title || "Kursus"}</h3>
                        <p className="mt-1 text-sm text-gray-500">Diterbitkan: {date}</p>
                        <p className="text-xs text-gray-400 mt-0.5">No: {cert.certificate_number}</p>
                      </div>
                    </div>

                    <a
                      href={"/api/certificate/" + cert.id}
                      target="_blank"
                      className="flex-shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                    >
                      Lihat & Cetak Sertifikat
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Belum ada sertifikat</h3>
            <p className="mt-2 text-sm text-gray-500">Selesaikan kursus untuk mendapatkan sertifikat kelulusan.</p>
            <Link href="/my-learning" className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
              Ke My Learning
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
