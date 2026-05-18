"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CheckoutClientProps {
  course: any;
  userId: string;
}

// Declare Snap global from Midtrans
declare global {
  interface Window { snap?: any; }
}

export function CheckoutClient({ course, userId }: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponData, setCouponData] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [snapReady, setSnapReady] = useState(false);

  // Load Midtrans Snap script
  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey) { setSnapReady(true); return; }

    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => setSnapReady(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const price = course.discount_price || course.price;
  const finalPrice = Math.max(0, price - discount);

  async function handlePay() {
    if (!finalPrice || finalPrice <= 0) {
      await handleEnrollFree();
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, couponCode: couponData?.code || "" }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.redirect) { router.push(data.redirect); return; }
        alert(data.error || "Pembayaran gagal");
        setLoading(false);
        return;
      }

      if (data.redirect) {
        // Gratis / free
        router.push(data.redirect);
        return;
      }

      // Buka Snap popup
      if (window.snap && data.snapToken) {
        window.snap.pay(data.snapToken, {
          onSuccess: () => { router.push(`/my-learning/${course.id}`); router.refresh(); },
          onPending: () => { router.push(`/my-learning/${course.id}`); },
          onError: () => { alert("Pembayaran gagal. Silakan coba lagi."); setLoading(false); },
          onClose: () => { setLoading(false); },
        });
      } else {
        alert("Snap Midtrans tidak tersedia. Periksa konfigurasi MIDTRANS_CLIENT_KEY.");
        setLoading(false);
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan");
      setLoading(false);
    }
  }

  async function handleEnrollFree() {
    setLoading(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });
      const data = await res.json();
      if (data.redirect) { router.push(data.redirect); router.refresh(); }
      else { alert("Gagal mendaftar"); setLoading(false); }
    } catch {
      alert("Gagal mendaftar");
      setLoading(false);
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponError("");

    try {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";
      const res = await fetch(
        `${pbUrl}/api/collections/coupons/records?filter=${encodeURIComponent(
          `code="${couponCode.trim()}" && is_active=true`
        )}&perPage=1`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const coupon = data.items?.[0];

      if (!coupon) { setCouponError("Kupon tidak ditemukan"); return; }
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) { setCouponError("Kupon sudah kadaluarsa"); return; }
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) { setCouponError("Kupon sudah habis digunakan"); return; }
      if (coupon.course && coupon.course !== course.id) { setCouponError("Kupon tidak berlaku untuk kursus ini"); return; }

      if (coupon.discount_type === "percentage") {
        setDiscount(Math.round((price * coupon.discount_value) / 100));
      } else {
        setDiscount(coupon.discount_value);
      }
      setCouponData(coupon);
    } catch { setCouponError("Gagal memeriksa kupon"); }
  }

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";
  const thumbnailUrl = course.thumbnail
    ? `${pbUrl}/api/files/courses/${course.id}/${course.thumbnail}`
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Course Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="h-20 w-36 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{course.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{course.instructor_expand?.name || "Instruktur"}</p>
              {course.discount_price ? (
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">Rp{course.discount_price.toLocaleString("id-ID")}</span>
                  <span className="text-sm text-gray-400 line-through">Rp{course.price.toLocaleString("id-ID")}</span>
                </div>
              ) : course.price > 0 ? (
                <p className="mt-2 font-bold text-gray-900 dark:text-white">Rp{course.price.toLocaleString("id-ID")}</p>
              ) : (
                <p className="mt-2 font-bold text-green-600">Gratis</p>
              )}
            </div>
          </div>

          {/* Coupon */}
          {course.price > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Punya Kupon?</h3>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Masukkan kode kupon"
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                >
                  Gunakan
                </button>
              </div>
              {couponError && <p className="mt-1 text-xs text-red-500">{couponError}</p>}
              {discount > 0 && <p className="mt-1 text-xs text-green-500">Diskon: Rp{discount.toLocaleString("id-ID")}</p>}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 h-fit">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Ringkasan Pesanan</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Harga kursus</span>
              <span>Rp{price.toLocaleString("id-ID")}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon kupon</span>
                <span>-Rp{discount.toLocaleString("id-ID")}</span>
              </div>
            )}
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>{finalPrice === 0 ? "Gratis" : `Rp${finalPrice.toLocaleString("id-ID")}`}</span>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={loading || (finalPrice > 0 && !snapReady)}
            className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
              loading || (finalPrice > 0 && !snapReady)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            {loading
              ? "Memproses..."
              : !snapReady && finalPrice > 0
                ? "Memuat pembayaran..."
                : finalPrice === 0
                  ? "Daftar Gratis"
                  : `Bayar Rp${finalPrice.toLocaleString("id-ID")}`}
          </button>

          <p className="mt-2 text-xs text-gray-500 text-center">
            Pembayaran diproses oleh <strong>Midtrans</strong> (GoPay, OVO, Bank Transfer, Kartu Kredit)
          </p>
          <p className="mt-1 text-xs text-gray-500 text-center">
            Dengan melanjutkan, Anda menyetujui{" "}
            <Link href="/terms" className="text-indigo-600">syarat & ketentuan</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
