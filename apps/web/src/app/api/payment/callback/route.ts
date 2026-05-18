// ============================================
// KuliahOnlineIT - Midtrans Callback Handler
// ============================================
// Menerima notifikasi status pembayaran dari Midtrans

import { NextResponse } from "next/server";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, transaction_id, payment_type, gross_amount, status_code } = body;

    console.log(`[Midtrans Callback] Order: ${order_id}, Status: ${transaction_status}`);

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Cari transaksi di PocketBase
    const txRes = await fetch(
      `${POCKETBASE_URL}/api/collections/transactions/records?filter=${encodeURIComponent(`midtrans_order_id="${order_id}"`)}&perPage=1`,
      { cache: "no-store" }
    );
    const txData = await txRes.json();
    const transaction = txData.items?.[0];

    if (!transaction) {
      console.error(`Transaction not found: ${order_id}`);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Map status Midtrans ke status kita
    let status = "pending";
    if (["capture", "settlement"].includes(transaction_status)) {
      status = "success";
    } else if (["deny", "cancel", "expire"].includes(transaction_status)) {
      status = "failed";
    } else if (transaction_status === "refund" || transaction_status === "partial_refund") {
      status = "refunded";
    }

    // Update transaksi
    await fetch(`${POCKETBASE_URL}/api/collections/transactions/records/${transaction.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        midtrans_transaction_id: transaction_id || "",
        payment_method: payment_type || "",
        payment_details: { ...(transaction.payment_details || {}), callback: body },
      }),
    });

    // Jika sukses, buat enrollment
    if (status === "success" && !transaction.enrollment) {
      const enrollRes = await fetch(`${POCKETBASE_URL}/api/collections/enrollments/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: transaction.student,
          course: transaction.course,
          payment_status: "success",
          progress: 0,
        }),
      });

      if (enrollRes.ok) {
        const enrollment = await enrollRes.json();
        // Link enrollment ke transaksi
        await fetch(`${POCKETBASE_URL}/api/collections/transactions/records/${transaction.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollment: enrollment.id }),
        });
      }
    }

    // Update kupon usage jika ada diskon
    if (status === "success" && transaction.coupon_code) {
      const couponRes = await fetch(
        `${POCKETBASE_URL}/api/collections/coupons/records?filter=${encodeURIComponent(`code="${transaction.coupon_code}"`)}&perPage=1`,
        { cache: "no-store" }
      );
      const couponData = await couponRes.json();
      const coupon = couponData.items?.[0];
      if (coupon) {
        await fetch(`${POCKETBASE_URL}/api/collections/coupons/records/${coupon.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current_uses: (coupon.current_uses || 0) + 1 }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Midtrans callback error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
