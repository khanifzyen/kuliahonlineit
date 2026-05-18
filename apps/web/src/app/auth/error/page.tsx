"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  default: {
    title: "Terjadi Kesalahan",
    description: "Terjadi kesalahan saat autentikasi. Silakan coba lagi.",
  },
  CredentialsSignin: {
    title: "Login Gagal",
    description: "Email atau password yang Anda masukkan salah.",
  },
  OAuthSignin: {
    title: "Login Gagal",
    description: "Terjadi kesalahan saat login dengan penyedia OAuth.",
  },
  OAuthCallback: {
    title: "Login Gagal",
    description: "Terjadi kesalahan saat menerima respons dari penyedia OAuth.",
  },
  OAuthCreateAccount: {
    title: "Gagal Buat Akun",
    description: "Terjadi kesalahan saat membuat akun dari penyedia OAuth.",
  },
  SessionRequired: {
    title: "Sesi Diperlukan",
    description: "Anda harus login untuk mengakses halaman ini.",
  },
  AccessDenied: {
    title: "Akses Ditolak",
    description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") || "default";
  const error = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{error.title}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error.description}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Kembali ke Login
          </Link>
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400">Memuat...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
