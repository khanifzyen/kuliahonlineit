// ============================================
// KuliahOnlineIT - Middleware (PocketBase Auth)
// ============================================
// Melindungi halaman yang memerlukan autentikasi
// Menggunakan cookie PocketBase (pb_auth)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "pb_auth";

// Halaman yang perlu login
const PROTECTED_PATHS = [
  "/my-learning",
  "/wishlist",
  "/instructor",
  "/checkout",
  "/settings",
  "/transactions",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah path perlu dilindungi
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected) {
    const authCookie = request.cookies.get(AUTH_COOKIE);

    // Parse cookie untuk cek token
    let isValid = false;
    if (authCookie?.value) {
      try {
        const parsed = JSON.parse(authCookie.value);
        isValid = !!parsed.token;
      } catch {
        // Cookie format invalid
      }
    }

    if (!isValid) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|auth).*)",
  ],
};
