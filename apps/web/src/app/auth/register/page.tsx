"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        email: form.email,
        password: form.password,
        passwordConfirm: form.confirmPassword,
        name: form.name,
      });

      if (result.ok) {
        setSuccess(true);
        // Redirect ke login setelah 4 detik (biar user sempat baca pesan verifikasi)
        setTimeout(() => {
          router.push("/auth/login");
        }, 4000);
      } else {
        setError(result.error || "Gagal mendaftar");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            KuliahOnlineIT
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Daftar Akun Baru
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Masuk
            </Link>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/30 p-4 space-y-2">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              ✅ Pendaftaran berhasil!
            </p>
            <p className="text-xs text-green-600 dark:text-green-300">
              Kami telah mengirim email verifikasi ke <strong>{form.email}</strong>.
              Silakan cek inbox (atau folder spam) Anda dan klik tautan verifikasi
              sebelum login.
            </p>
            <p className="text-xs text-green-600 dark:text-green-300">
              Mengarahkan ke halaman login dalam beberapa detik...
            </p>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Nama lengkap Anda"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="contoh@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ulangi password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Memproses..." : success ? "Berhasil!" : "Daftar"}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Dengan mendaftar, Anda menyetujui{" "}
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">Syarat & Ketentuan</Link>{" "}
            dan{" "}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">Kebijakan Privasi</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
