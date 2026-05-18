"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function ForgotPasswordPage() {
  const { requestVerification } = useAuth();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSent(false);
    setLoading(true);

    try {
      // PocketBase: requestPasswordReset mengirim email dengan link reset
      const pb = (await import("pocketbase")).default;
      const client = new pb(
        process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090"
      );
      await client.collection("users").requestPasswordReset(email);
      setSent(true);
    } catch (err: unknown) {
      const obj = err as Record<string, unknown>;
      const response = obj?.response as Record<string, unknown> | undefined;
      const data = response?.data as Record<string, unknown> | undefined;
      const message =
        typeof data?.message === "string"
          ? data.message
          : typeof obj?.message === "string"
            ? obj.message
            : "";
      setError(
        message || "Gagal mengirim email reset password. Coba lagi nanti."
      );
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
            Lupa Password
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Masukkan email Anda dan kami akan mengirim tautan reset password.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Success */}
        {sent && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/30 p-4 space-y-2">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              ✅ Email terkirim!
            </p>
            <p className="text-xs text-green-600 dark:text-green-300">
              Kami telah mengirim tautan reset password ke{" "}
              <strong>{email}</strong>.
              Silakan cek inbox (atau folder spam) Anda.
            </p>
            <p className="text-xs text-green-600 dark:text-green-300">
              Tautan berlaku selama 1 jam.
            </p>
          </div>
        )}

        {/* Form */}
        {!sent && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="contoh@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Mengirim..." : "Kirim Tautan Reset"}
            </button>
          </form>
        )}

        {/* Back to login */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Kembali ke halaman login
          </Link>
        </div>
      </div>
    </div>
  );
}
