import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";

async function getTransactions(userId: string) {
  try {
    const res = await fetch(
      `${POCKETBASE_URL}/api/collections/transactions/records?filter=${encodeURIComponent(`student="${userId}"`)}&sort=-created&expand=course&perPage=50`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "Menunggu Pembayaran", color: "text-yellow-600 bg-yellow-50 dark:text-yellow-300 dark:bg-yellow-900/20" },
  success: { label: "Berhasil", color: "text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-900/20" },
  failed: { label: "Gagal", color: "text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/20" },
  refunded: { label: "Dikembalikan", color: "text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-gray-900/20" },
};

export default async function TransactionsPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login?callbackUrl=/transactions");

  const transactions = await getTransactions(user.id);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Transaksi</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Semua transaksi pembelian kursus Anda
        </p>

        {transactions.length > 0 ? (
          <div className="mt-6 space-y-4">
            {transactions.map((tx: any) => {
              const course = tx.expand?.course;
              const status = STATUS_LABEL[tx.status] || STATUS_LABEL.pending;
              const date = new Date(tx.created).toLocaleDateString("id-ID", {
                year: "numeric", month: "long", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              });

              return (
                <div key={tx.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {course?.title || "Kursus"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        Rp{(tx.total || tx.amount || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                  {tx.payment_method && (
                    <p className="mt-2 text-xs text-gray-400">via {tx.payment_method}</p>
                  )}
                  {tx.status === "pending" && (
                    <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                      {tx.midtrans_order_id ? `Order ID: ${tx.midtrans_order_id}` : "Menunggu konfirmasi pembayaran"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Belum ada transaksi</h3>
            <p className="mt-2 text-sm text-gray-500">Anda belum melakukan pembelian kursus apapun.</p>
            <Link href="/courses" className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
              Jelajahi Kursus
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
