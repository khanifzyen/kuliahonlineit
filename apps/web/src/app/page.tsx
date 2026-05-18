import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          KuliahOnlineIT
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600"
          >
            Masuk
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Daftar
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Belajar Apapun,
          <span className="text-indigo-600 dark:text-indigo-400"> Kapanpun, Di manapun</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Ribuan kursus online dari instruktur profesional. Tingkatkan skill-mu
          dan raih karir impian bersama KuliahOnlineIT.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/auth/register"
            className="rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Mulai Belajar Gratis
          </Link>
          <Link
            href="/courses"
            className="rounded-xl border border-gray-300 dark:border-gray-700 px-8 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            Jelajahi Kursus
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 px-6 py-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} KuliahOnlineIT. All rights reserved.
      </footer>
    </div>
  );
}
