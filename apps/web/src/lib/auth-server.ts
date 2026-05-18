// ============================================
// KuliahOnlineIT - Server-side Auth Helper
// ============================================
// Untuk membaca auth dari server component / API route
// Membaca cookie PocketBase yang di-set oleh client

import PocketBase, { type RecordModel } from "pocketbase";
import { cookies } from "next/headers";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";
const AUTH_COOKIE = "pb_auth";

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  collectionId: string;
  collectionName: string;
}

/**
 * Mendapatkan user yang sedang login dari server component.
 * Membaca cookie PocketBase, memvalidasi token, dan return user record.
 */
export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieJar = await cookies();
    const authCookie = cookieJar.get(AUTH_COOKIE);
    if (!authCookie?.value) return null;

    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.loadFromCookie(`${AUTH_COOKIE}=${authCookie.value}`);

    if (!pb.authStore.isValid) return null;

    // Refresh token untuk validasi
    try {
      const { record } = await pb.collection("users").authRefresh();
      return {
        id: record.id,
        email: record.email,
        name: record.name || record.email?.split("@")[0] || "",
        avatar: record.avatar || "",
        collectionId: record.collectionId,
        collectionName: record.collectionName,
      };
    } catch {
      // Token expired
      pb.authStore.clear();
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Cek apakah user sudah login (lebih ringan dari getServerUser karena tanpa refresh token)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieJar = await cookies();
    const authCookie = cookieJar.get(AUTH_COOKIE);
    if (!authCookie?.value) return false;

    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.loadFromCookie(`${AUTH_COOKIE}=${authCookie.value}`);
    return pb.authStore.isValid;
  } catch {
    return false;
  }
}

export { PocketBase, POCKETBASE_URL };
