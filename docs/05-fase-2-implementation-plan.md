# 📋 Implementasi Phase 2 — Interaksi & Pembayaran

> **Rencana implementasi Phase 2 — Fitur interaksi siswa dan payment**
> Target: Review & Rating, Wishlist, Q&A Forum, Catatan (Notes), Riwayat Transaksi, Midtrans Payment

---

## ✅ Status Legend
- ⬜ Belum dikerjakan
- 🔄 Sedang dikerjakan
- ✅ Selesai & lulus test

---

## 0. ⚙️ Prasyarat Phase 2
Phase 1 (MVP) sudah selesai. Semua collection sudah termigrasi, auth berfungsi, dan halaman dasar sudah jalan.

---

## 1. ⭐ Review & Rating

| # | Task | Test | Status |
|---|------|------|--------|
| 1.1 | **Review form** — Form rating bintang + komentar di detail kursus | Render form, submit sukses | ✅ |
| 1.2 | **Submit review** — POST ke `reviews` collection via API | Record terbuat | ✅ |
| 1.3 | **Edit/Hapus review** — Hanya pemilik review | ⬅️ (future) | ⬜ |
| 1.4 | **Average rating** — Hitung ulang `average_rating` | ⬅️ (future) | ⬜ |
| 1.5 | **Cegah double review** — Unique index `(student, course)` | Error handling sudah | ✅ |

## 2. 💖 Wishlist

| # | Task | Test | Status |
|---|------|------|--------|
| 2.1 | **Add to wishlist** — Tombol di halaman detail kursus | `wishlists` record terbuat | ✅ |
| 2.2 | **Remove from wishlist** — Tombol toggle di detail kursus | Record terhapus | ✅ |
| 2.3 | **Halaman `/wishlist`** — List semua kursus + empty state | Render daftar | ✅ |
| 2.4 | **Wishlist badge** — Icon heart di navbar | ⬅️ (nice to have) | ⬜ |
| 2.5 | **Move wishlist to checkout** — Tombol langsung checkout | ⬅️ (Phase 2 saja) | ✅ |

## 3. 💬 Q&A Forum

| # | Task | Test | Status |
|---|------|------|--------|
| 3.1 | **Buat thread** — Form pertanyaan di halaman detail | ✅ |
| 3.2 | **List thread** — Daftar pertanyaan per kursus | ✅ |
| 3.3 | **Detail thread** — Lihat pertanyaan + jawaban (expandable) | ✅ |
| 3.4 | **Jawab thread** — Form jawaban inline | ✅ |
| 3.5 | **Instructor badge** — `is_instructor_reply` label | ✅ |
| 3.6 | **Mark resolved** — Tombol tandai selesai | ✅ |
| 3.7 | **Filter Q&A** — Semua / belum terjawab / sudah terjawab | ⬅️ (future) | ⬜ |

## 4. 📝 Catatan (Notes)

| # | Task | Test | Status |
|---|------|------|--------|
| 4.1 | **Buat catatan** — Tombol/panel di course player | `notes` record terbuat | ⬜ |
| 4.2 | **Timestamp otomatis** — Catatan menyimpan posisi video (detik) | `timestamp` terisi | ⬜ |
| 4.3 | **Edit/Hapus catatan** — Kelola catatan sendiri | Update & delete | ⬜ |
| 4.4 | **List catatan per kursus** — Sidebar/tab di course player | Render daftar catatan | ⬜ |
| 4.5 | **Jump-to-position** — Klik timestamp → lompat ke posisi video | Video seek ke detik tsb | ⬜ |

## 5. 🛒 Midtrans Payment

| # | Task | Test | Status |
|---|------|------|--------|
| 5.1 | **Midtrans Snap integration** — Redirect ke Midtrans dari checkout | Snap popup muncul | ⬜ |
| 5.2 | **Create transaction** — POST ke Midtrans API via server | `transactions` record terbuat | ⬜ |
| 5.3 | **Midtrans callback handler** — API route `/api/payment/callback` | Status update sukses | ⬜ |
| 5.4 | **Auto-enroll after payment** — Jika status success → buat enrollment | Enrollment terbuat | ⬜ |
| 5.5 | **Halaman transaksi sukses** — Redirect setelah bayar | Tampilkan konfirmasi | ⬜ |
| 5.6 | **Halaman transaksi gagal** — Jika payment failed | Tampilkan error + retry | ⬜ |
| 5.7 | **Riwayat transaksi `/transactions`** — List semua transaksi user | Render list + empty state | ✅ |

## 6. 📜 Sertifikat Kelulusan

| # | Task | Test | Status |
|---|------|------|--------|
| 6.1 | **Auto-generate certificate** — Saat progress 100%, buat sertifikat | `certificates` record terbuat | ⬜ |
| 6.2 | **Nomor sertifikat unik** — Generate nomor unik | Unique constraint | ⬜ |
| 6.3 | **Halaman `/certificates`** — Lihat semua sertifikat | Render list | ⬜ |
| 6.4 | **Download PDF** — Download/print sertifikat | File PDF terdownload | ⬜ |

## 7. 🧪 Testing Phase 2

| # | Task | Test | Status |
|---|------|------|--------|
| 7.1 | **Test review form & submission** | Unit test | ⬜ |
| 7.2 | **Test wishlist add/remove** | Unit test | ⬜ |
| 7.3 | **Test Q&A thread & answer** | Unit test | ⬜ |
| 7.4 | **Test notes CRUD** | Unit test | ⬜ |
| 7.5 | **Test payment flow (mock Midtrans)** | Integration test | ⬜ |
| 7.6 | **Test certificate generation** | Unit test | ⬜ |

---

## 📊 Ringkasan Phase 2

| Area | Jumlah Task |
|------|:-----------:|
| ⭐ Review & Rating | 5 |
| 💖 Wishlist | 5 |
| 💬 Q&A Forum | 7 |
| 📝 Catatan (Notes) | 5 |
| 🛒 Midtrans Payment | 7 |
| 📜 Sertifikat | 4 |
| 🧪 Testing | 6 |
| **Total** | **39** |

---

## 🎯 Prioritas dalam Phase 2

### Urutan Pengerjaan yang Direkomendasikan

1. **Midtrans Payment** — Karena terkait revenue dan harus berfungsi untuk paid courses
2. **Review & Rating** — Fitur sosial penting untuk konversi
3. **Wishlist** — Menyimpan minat user, meningkatkan engagement
4. **Q&A Forum** — Interaksi siswa-instructor
5. **Catatan (Notes)** — Personalisasi belajar
6. **Sertifikat** — Reward penyelesaian kursus
