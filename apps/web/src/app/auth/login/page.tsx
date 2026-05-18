"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/my-learning";
  const { login, requestVerification } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setUnverified(false);
    setVerificationSent(false);
    setLoading(true);

    const result = await login(form.email, form.password);

    if (result.ok) {
      router.push(callbackUrl);
      router.refresh();
    } else {
      if (result.unverified) {
        setUnverified(true);
      } else {
        setError(result.error || "Email atau password salah");
      }
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!form.email || sendingVerification) return;
    setSendingVerification(true);
    setVerificationSent(false);
    const result = await requestVerification(form.email);
    if (result.ok) {
      setVerificationSent(true);
    } else {
      setError(result.error || "Gagal mengirim ulang email verifikasi");
    }
    setSendingVerification(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            KuliahOnlineIT
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Masuk</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Daftar sekarang
            </Link>
          </p>
        </div>

        {error && !unverified && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {unverified && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/30 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Email belum diverifikasi
              </p>
              <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                Silakan cek inbox (atau folder spam) email <strong>{form.email}</strong>
                dan klik tautan verifikasi sebelum login.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={sendingVerification || verificationSent}
                className="text-xs font-medium text-yellow-800 dark:text-yellow-200 underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingVerification
                  ? "Mengirim..."
                  : verificationSent
                    ? "✓ Email verifikasi terkirim"
                    : "Kirim ulang email verifikasi"}
              </button>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                id="email" name="email" type="email" autoComplete="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="contoh@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                id="password" name="password" type="password" autoComplete="current-password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Masukkan password"
              />
            </div>
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Lupa password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400">Memuat...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
