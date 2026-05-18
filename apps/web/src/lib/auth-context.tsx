// ============================================
// KuliahOnlineIT - PocketBase Auth Client
// ============================================
// Client-side auth provider menggunakan PocketBase SDK
// Menyediakan React Context untuk state auth global

"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import PocketBase, { type RecordModel } from "pocketbase";

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";
const AUTH_COOKIE = "pb_auth";

interface AuthContextType {
  pb: PocketBase;
  user: RecordModel | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { email: string; password: string; passwordConfirm: string; name: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function createPbClient() {
  const pb = new PocketBase(POCKETBASE_URL);

  // Restore auth dari cookie untuk SSR
  if (typeof document !== "undefined") {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${AUTH_COOKIE}=`));
    if (cookie) {
      try {
        pb.authStore.loadFromCookie(cookie);
      } catch {
        // ignore invalid cookie
      }
    }
  }

  // Simpan auth ke cookie dan localStorage
  pb.authStore.onChange(() => {
    const cookie = pb.authStore.exportToCookie({ httpOnly: false, secure: false, sameSite: "lax" });
    document.cookie = cookie;
  });

  return pb;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [pb] = useState(createPbClient);
  const [user, setUser] = useState<RecordModel | null>(pb.authStore.record);
  const [loading, setLoading] = useState(!pb.authStore.isValid);

  const refresh = useCallback(async () => {
    try {
      if (pb.authStore.isValid) {
        // Coba refresh token
        const { record } = await pb.collection("users").authRefresh();
        setUser(record);
      } else {
        setUser(null);
      }
    } catch {
      pb.authStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [pb]);

  useEffect(() => {
    // Auto-refresh on mount (validate existing token)
    refresh();

    // Listen for auth store changes
    const unsubscribe = pb.authStore.onChange((token, record) => {
      setUser(record || null);
    });

    return () => unsubscribe();
  }, [pb, refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { record } = await pb.collection("users").authWithPassword(email, password);
        setUser(record);
        return { ok: true };
      } catch (err: unknown) {
        const msg = extractPbError(err) || "Email atau password salah";
        return { ok: false, error: msg };
      }
    },
    [pb]
  );

  const register = useCallback(
    async (data: { email: string; password: string; passwordConfirm: string; name: string }) => {
      try {
        await pb.collection("users").create(data);
        return { ok: true };
      } catch (err: unknown) {
        const msg = extractPbError(err) || "Gagal mendaftar";
        return { ok: false, error: msg };
      }
    },
    [pb]
  );

  const logout = useCallback(() => {
    pb.authStore.clear();
    document.cookie = `${AUTH_COOKIE}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    setUser(null);
  }, [pb]);

  return (
    <AuthContext.Provider value={{ pb, user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

function extractPbError(err: unknown): string | null {
  const obj = err as Record<string, unknown>;
  const response = obj?.response as Record<string, unknown> | undefined;
  const data = response?.data as Record<string, unknown> | undefined;

  if (data?.message && typeof data.message === "string") {
    const msg = data.message.toLowerCase();
    if (msg.includes("duplicate") || msg.includes("already exists")) return "Email sudah terdaftar";
    if (msg.includes("validation")) return "Data tidak valid. Periksa kembali input Anda.";
    return data.message as string;
  }

  if (obj?.message && typeof obj.message === "string") {
    if (obj.message.toLowerCase().includes("failed to authenticate")) return "Email atau password salah";
    return obj.message as string;
  }

  return null;
}
