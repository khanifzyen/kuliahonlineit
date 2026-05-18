# 📋 Implementasi Phase 1 (MVP)

> **Rencana implementasi Phase 1 — Foundation MVP**
> Target: Autentikasi + Halaman Utama + Course Listing + Detail Kursus + Checkout + My Learning + Course Player

---

## ✅ Status Legend
- ⬜ Belum dikerjakan
- 🔄 Sedang dikerjakan
- ✅ Selesai & lulus test

---

## 0. ⚙️ Setup Infrastruktur

| # | Task | Test | Status |
|---|------|------|--------|
| 0.1 | Setup Bun test runner (`bun test`) | `bun test` berjalan tanpa error | ✅ |
| 0.2 | Jalankan PocketBase via Docker | `curl localhost:8090/api/health` → OK | ✅ |
| 0.3 | Setup superuser PocketBase otomatis | Superuser terdaftar | ✅ |
| 0.4 | Migrasi database (PocketBase 0.38 API) | 15 koleksi + seed terbuat | ✅ |

## 1. 🔐 Autentikasi

| # | Task | Test | Status |
|---|------|------|--------|
| 1.1 | Halaman Login (`/auth/login`) | Render form, login sukses, redirect | ⬜ |
| 1.2 | Halaman Register (`/auth/register`) | Render form, register sukses | ⬜ |
| 1.3 | Error page (`/auth/error`) | Render error message | ⬜ |
| 1.4 | Logout flow | Session terhapus, redirect ke home | ⬜ |

## 2. 🏠 Halaman Home

| # | Task | Test | Status |
|---|------|------|--------|
| 2.1 | Hero section (statis) | Render hero + CTA button | ✅ |
| 2.2 | Kategori grid (dari PocketBase) | Fetch & tampilkan kategori | ⬜ |
| 2.3 | Kursus unggulan (featured) | Fetch & tampilkan slider | ⬜ |
| 2.4 | Kursus terbaru | Fetch & tampilkan | ⬜ |
| 2.5 | Navbar (login-aware) | Student vs guest berbeda | ⬜ |
| 2.6 | Footer | Render footer | ✅ |

## 3. 🔍 Course Listing

| # | Task | Test | Status |
|---|------|------|--------|
| 3.1 | Halaman `/courses` | List semua kursus published | ⬜ |
| 3.2 | Filter kategori | Filter by category | ⬜ |
| 3.3 | Filter level | Beginner, Intermediate, Advanced | ⬜ |
| 3.4 | Filter harga | Gratis / Berbayar | ⬜ |
| 3.5 | Search | Cari berdasarkan judul | ⬜ |
| 3.6 | Sort | Terbaru, terpopuler, rating | ⬜ |
| 3.7 | Pagination / Load more | Halaman berikutnya | ⬜ |
| 3.8 | Course card component | Thumbnail, judul, rating, harga | ⬜ |

## 4. 📄 Detail Kursus

| # | Task | Test | Status |
|---|------|------|--------|
| 4.1 | Halaman `/courses/[slug]` | Render detail kursus | ⬜ |
| 4.2 | Hero detail | Thumbnail, judul, subtitle, rating, instructor | ⬜ |
| 4.3 | Kurikulum (section & lecture tree) | Expandable list | ⬜ |
| 4.4 | Free preview video | Putar video preview | ⬜ |
| 4.5 | Instructor info | Profil instructor | ⬜ |
| 4.6 | Reviews & Rating | List ulasan + average rating | ⬜ |
| 4.7 | Wishlist button | Add/remove from wishlist | ⬜ |
| 4.8 | Price display & CTA | Harga + diskon + tombol beli | ⬜ |
| 4.9 | What you'll learn | Checkbox list | ⬜ |
| 4.10 | Requirements & target audience | Accordion | ⬜ |

## 5. 🛒 Checkout & Pembayaran

| # | Task | Test | Status |
|---|------|------|--------|
| 5.1 | Halaman `/checkout/[courseId]` | Ringkasan pesanan | ⬜ |
| 5.2 | Input kupon | Apply coupon code | ⬜ |
| 5.3 | Midtrans Snap integration | Redirect ke Midtrans | ⬜ |
| 5.4 | Midtrans callback handler | Update transaksi & enrollment | ⬜ |
| 5.5 | Halaman sukses / failed | Redirect setelah bayar | ⬜ |
| 5.6 | Riwayat transaksi `/transactions` | List transaksi user | ⬜ |

## 6. 📚 My Learning

| # | Task | Test | Status |
|---|------|------|--------|
| 6.1 | Halaman `/my-learning` | List kursus terdaftar + progress | ⬜ |
| 6.2 | Progress bar per kursus | % progress | ⬜ |
| 6.3 | Continue learning | Resume button | ⬜ |
| 6.4 | Empty state | "Belum ada kursus" | ⬜ |

## 7. 🎬 Course Player

| # | Task | Test | Status |
|---|------|------|--------|
| 7.1 | Halaman `/my-learning/[courseId]` | Layout player (video + sidebar) | ⬜ |
| 7.2 | Video player component | Play, pause, seek | ⬜ |
| 7.3 | Sidebar kurikulum | Navigasi lecture + status centang | ⬜ |
| 7.4 | Lecture content (video/article) | Render sesuai tipe | ⬜ |
| 7.5 | Auto-resume | Lanjut dari posisi terakhir | ⬜ |
| 7.6 | Mark complete | Tandai selesai | ⬜ |
| 7.7 | Progress tracking | Update `lecture_progress` | ⬜ |
| 7.8 | Download resource | Download file lecture | ⬜ |
| 7.9 | Empty state (no enrollment) | Redirect ke detail kursus | ⬜ |

---

## 🧪 Test Structure

```
apps/web/src/__tests__/
├── setup.ts                  # Global test setup (PocketBase mock)
├── helpers.ts                # Test utilities
├── auth/
│   ├── login.test.ts         # Login page tests
│   └── register.test.ts      # Register page tests
├── home.test.ts              # Home page tests
├── courses/
│   ├── listing.test.ts       # Course listing tests
│   └── detail.test.ts        # Course detail tests
├── checkout.test.ts          # Checkout page tests
├── my-learning.test.ts       # My Learning page tests
└── course-player.test.ts     # Course Player tests
```

---

## 📦 Dependencies untuk Testing

```bash
# Test runner (built-in Bun)
bun test

# Untuk mocking & assertions
# bun:test sudah built-in mirip Jest
# - expect, describe, it, mock, spyOn tersedia native
```

Semua test dijalankan dengan:
```bash
bun test
```
