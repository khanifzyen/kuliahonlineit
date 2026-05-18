// ============================================
// KuliahOnlineIT - PocketBase Client
// ============================================
// Utility untuk koneksi ke PocketBase
// Bisa digunakan di server maupun client

import PocketBase from "pocketbase";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";

// Singleton untuk server-side
let _pb: PocketBase | null = null;

export function getPocketBase(): PocketBase {
  if (typeof window === "undefined") {
    // Server-side: buat instance baru setiap kali
    return new PocketBase(POCKETBASE_URL);
  }
  // Client-side: reuse instance
  if (!_pb) {
    _pb = new PocketBase(POCKETBASE_URL);

    // Restore auth dari cookie
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("pb_auth="));
    if (cookie) {
      try {
        _pb.authStore.loadFromCookie(cookie);
      } catch {
        // ignore
      }
    }

    // Simpan auth ke cookie setiap ada perubahan
    _pb.authStore.onChange(() => {
      document.cookie = _pb!.authStore.exportToCookie({ httpOnly: false });
    });
  }
  return _pb;
}

// Untuk server component - bisa注入 cookie dari request
export function getPocketBaseWithAuth(cookie?: string): PocketBase {
  const pb = new PocketBase(POCKETBASE_URL);
  if (cookie) {
    pb.authStore.loadFromCookie(cookie);
  }
  return pb;
}
