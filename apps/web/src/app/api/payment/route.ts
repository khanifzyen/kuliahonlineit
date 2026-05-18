// ============================================
// KuliahOnlineIT - Midtrans Payment API
// ============================================
// Membuat transaksi Midtrans Snap dan mengembalikan redirect URL

import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, couponCode } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "courseId required" }, { status: 400 });
    }

    // Ambil data course dari PocketBase
    const courseRes = await fetch(`${POCKETBASE_URL}/api/collections/courses/records/${courseId}`, {
      cache: "no-store",
    });
    if (!courseRes.ok) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    const course = await courseRes.json();

    // Cek apakah user sudah enrolled
    const enrollRes = await fetch(
      `${POCKETBASE_URL}/api/collections/enrollments/records?filter=${encodeURIComponent(`student="${user.id}" && course="${courseId}"`)}&perPage=1`,
      { cache: "no-store" }
    );
    const enrollData = await enrollRes.json();
    if (enrollData.items?.length > 0) {
      return NextResponse.json({ error: "Already enrolled", redirect: `/my-learning/${courseId}` }, { status: 400 });
    }

    // Hitung harga
    let amount = course.discount_price || course.price || 0;
    let discount = 0;

    // Terapkan kupon jika ada
    if (couponCode) {
      const couponRes = await fetch(
        `${POCKETBASE_URL}/api/collections/coupons/records?filter=${encodeURIComponent(`code="${couponCode}" && is_active=true`)}&perPage=1`,
        { cache: "no-store" }
      );
      const couponData = await couponRes.json();
      const coupon = couponData.items?.[0];

      if (coupon) {
        if (coupon.course && coupon.course !== courseId) {
          return NextResponse.json({ error: "Kupon tidak berlaku untuk kursus ini" }, { status: 400 });
        }
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
          return NextResponse.json({ error: "Kupon sudah kadaluarsa" }, { status: 400 });
        }
        if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
          return NextResponse.json({ error: "Kupon sudah habis digunakan" }, { status: 400 });
        }

        if (coupon.discount_type === "percentage") {
          discount = Math.round((amount * coupon.discount_value) / 100);
        } else {
          discount = coupon.discount_value;
        }
      } else {
        return NextResponse.json({ error: "Kupon tidak ditemukan" }, { status: 400 });
      }
    }

    const finalAmount = Math.max(0, amount - discount);
    const fee = Math.round(finalAmount * 0.1); // 10% platform fee
    const grossAmount = finalAmount;

    if (grossAmount === 0) {
      // Gratis: langsung enroll
      const enrollRes = await fetch(`${POCKETBASE_URL}/api/collections/enrollments/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: user.id,
          course: courseId,
          payment_status: "success",
          progress: 0,
        }),
      });

      if (!enrollRes.ok) {
        return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
      }

      // Catat transaksi gratis
      await fetch(`${POCKETBASE_URL}/api/collections/transactions/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: user.id,
          course: courseId,
          amount: 0,
          fee: 0,
          total: 0,
          currency: "IDR",
          payment_method: "free",
          status: "success",
        }),
      });

      // Notification
      await fetch(`${POCKETBASE_URL}/api/collections/notifications/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user.id,
          type: "enroll",
          title: "Pendaftaran kursus berhasil",
          message: `Anda berhasil mendaftar kursus "${course.title || courseId}". Selamat belajar!`,
          link: `/my-learning/${courseId}`,
          is_read: false,
        }),
      });

      return NextResponse.json({ redirect: `/my-learning/${courseId}` });
    }

    // === MIDTRANS SNAP ===
    const midtransClient = (await import("midtrans-client")).default;
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    });

    const orderId = `KULIAH-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Simpan transaksi pending
    const txRes = await fetch(`${POCKETBASE_URL}/api/collections/transactions/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student: user.id,
        course: courseId,
        amount: amount,
        fee: fee,
        total: grossAmount,
        currency: "IDR",
        status: "pending",
        midtrans_order_id: orderId,
      }),
    });
    const transaction = await txRes.json();

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: user.name || user.email.split("@")[0],
        email: user.email,
      },
      item_details: [
        {
          id: courseId,
          price: grossAmount,
          quantity: 1,
          name: course.title?.slice(0, 50) || "Kursus",
          category: "Course",
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/my-learning/${courseId}`,
        error: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/${courseId}?status=error`,
      },
    };

    const tokenResponse = await snap.createTransactionToken(parameter);

    // Update transaksi dengan token
    await fetch(`${POCKETBASE_URL}/api/collections/transactions/records/${transaction.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_details: { snap_token: tokenResponse } }),
    });

    return NextResponse.json({
      snapToken: tokenResponse,
      transactionId: transaction.id,
      orderId,
    });
  } catch (error: any) {
    console.error("Midtrans error:", error);
    return NextResponse.json({ error: error.message || "Payment failed" }, { status: 500 });
  }
}
