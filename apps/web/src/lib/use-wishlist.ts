// ============================================
// KuliahOnlineIT - Wishlist Hook
// ============================================

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./auth-context";

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

export function useWishlist(courseId?: string) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load all wishlist IDs for current user
  const refresh = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    try {
      const res = await fetch(
        `${POCKETBASE_URL}/api/collections/wishlists/records?filter=${encodeURIComponent(`student="${user.id}"`)}&perPage=50`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      setWishlistIds(new Set((data.items || []).map((item: any) => item.course)));
    } catch {
      // silent
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWishlisted = courseId ? wishlistIds.has(courseId) : false;

  const toggle = useCallback(async () => {
    if (!user || !courseId) return;
    setLoading(true);
    try {
      if (wishlistIds.has(courseId)) {
        // Hapus: cari record id dulu
        const res = await fetch(
          `${POCKETBASE_URL}/api/collections/wishlists/records?filter=${encodeURIComponent(`student="${user.id}" && course="${courseId}"`)}&perPage=1`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          const record = data.items?.[0];
          if (record) {
            await fetch(`${POCKETBASE_URL}/api/collections/wishlists/records/${record.id}`, {
              method: "DELETE",
            });
          }
        }
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
      } else {
        // Tambah
        await fetch(`${POCKETBASE_URL}/api/collections/wishlists/records`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student: user.id, course: courseId }),
        });
        setWishlistIds((prev) => new Set(prev).add(courseId));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user, courseId, wishlistIds]);

  const count = wishlistIds.size;

  return { isWishlisted, toggle, loading, count, refresh };
}
