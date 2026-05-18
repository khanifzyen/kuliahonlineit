import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";

async function getWishlistCourses(userId: string) {
  try {
    const res = await fetch(
      `${POCKETBASE_URL}/api/collections/wishlists/records?filter=${encodeURIComponent(`student="${userId}"`)}&sort=-created&expand=course&perPage=50`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export default async function WishlistPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login?callbackUrl=/wishlist");

  const wishlist = await getWishlistCourses(user.id);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wishlist</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kursus yang Anda simpan untuk nanti
        </p>

        {wishlist.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {wishlist.map((item: any) => {
              const course = item.expand?.course;
              if (!course) return null;
              const thumb = course.thumbnail
                ? `${POCKETBASE_URL}/api/files/courses/${course.id}/${course.thumbnail}`
                : null;

              return (
                <Link
                  key={item.id}
                  href={`/courses/${course.slug || course.id}`}
                  className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                    {thumb ? (
                      <img src={thumb} alt={course.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600">
                      {course.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      {course.discount_price ? (
                        <>
                          <span className="text-sm font-bold">Rp{course.discount_price.toLocaleString("id-ID")}</span>
                          <span className="text-xs text-gray-400 line-through">Rp{course.price.toLocaleString("id-ID")}</span>
                        </>
                      ) : course.price > 0 ? (
                        <span className="text-sm font-bold">Rp{course.price.toLocaleString("id-ID")}</span>
                      ) : (
                        <span className="text-sm font-bold text-green-600">Gratis</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Wishlist masih kosong</h3>
            <p className="mt-2 text-sm text-gray-500">Simpan kursus favorit Anda dengan mengklik ikon hati di halaman detail kursus.</p>
            <Link href="/courses" className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
              Jelajahi Kursus
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
