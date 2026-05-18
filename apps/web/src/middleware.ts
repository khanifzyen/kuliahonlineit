// ============================================
// KuliahOnlineIT - Next.js Middleware
// ============================================
// Melindungi halaman yang memerlukan autentikasi

import { withAuth } from "next-auth/middleware";

export default withAuth({
  secret: process.env.AUTH_SECRET,
});

export const config = {
  matcher: [
    // Halaman yang perlu login
    "/my-learning/:path*",
    "/wishlist/:path*",
    "/instructor/:path*",
    "/checkout/:path*",
    "/settings/:path*",
  ],
};
