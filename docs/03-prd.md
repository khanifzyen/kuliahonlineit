# 📋 PRD — KuliahOnlineIT Product Requirements Document

> **Dokumen Kebutuhan Produk (PRD) untuk platform pembelajaran online KuliahOnlineIT**
> Versi: 1.0 — 18 Mei 2026
> Status: Draft

---

## 📑 Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Tujuan & Metrik](#2-tujuan--metrik)
3. [Persona Pengguna](#3-persona-pengguna)
4. [Fitur — Role Student](#4-fitur--role-student)
5. [Fitur — Role Instructor](#5-fitur--role-instructor)
6. [Fitur — Role Admin](#6-fitur--role-admin)
7. [Fitur Lintas Role](#7-fitur-lintas-role)
8. [Alur Pembayaran](#8-alur-pembayaran)
9. [Struktur Halaman (Sitemap)](#9-struktur-halaman-sitemap)
10. [Prioritas Pengembangan](#10-prioritas-pengembangan)

---

## 1. Ringkasan Eksekutif

### 1.1 Visi
Menjadi platform belajar *online* nomor satu di Indonesia yang menghubungkan siswa dengan instruktur profesional melalui kursus berkualitas tinggi.

### 1.2 Misi
- Menyediakan akses pendidikan berkualitas untuk semua kalangan
- Memberdayakan para ahli untuk berbagi ilmu dan menghasilkan pendapatan
- Membangun ekosistem belajar interaktif dengan fitur Q&A, catatan, dan sertifikat

### 1.3 Value Proposition
| Pengguna | Value |
|----------|-------|
| **Student** | Ribuan kursus berkualitas, harga terjangkau, akses seumur hidup, sertifikat resmi |
| **Instructor** | Platform mudah digunakan, payout transparan, tools pengajaran lengkap |
| **Platform** | Revenue share dari transaksi, skala global |

### 1.4 Model Bisnis
- **Revenue Share**: Platform mengambil biaya (fee) dari setiap transaksi kursus berbayar
- **Premium Features** (opsional): Fitur berbayar untuk instructor (promosi, analytics lanjutan)

---

## 2. Tujuan & Metrik

### 2.1 Tujuan Bisnis (OKRs)
1. **Akuisisi Pengguna**: 10.000 student terdaftar dalam 6 bulan pertama
2. **Konten**: 500+ kursus published dari 100+ instructor
3. **Revenue**: Rp 1 Miliar GTV (Gross Transaction Value) di tahun pertama
4. **Retensi**: 60% student menyelesaikan minimal 1 kursus

### 2.2 Key Metrics (KPI)
| Metrik | Target | Dimana Dilacak |
|--------|--------|----------------|
| **Conversion Rate** (visit → enroll) | 5% | Midtrans + Analytics |
| **Course Completion Rate** | 25% | Lecture Progress |
| **Average Rating** | 4.5/5 | Reviews |
| **Instructor Payout** | On-time monthly | Transactions |
| **NPS (Net Promoter Score)** | 60+ | Survey |

---

## 3. Persona Pengguna

### 3.1 Student (Siswa)
| Atribut | Detail |
|---------|--------|
| **Tipe** | End-user pembeli & konsumen kursus |
| **Kebutuhan** | Menemukan kursus relevan, belajar dengan nyaman, tracking progress, mendapatkan sertifikat |
| **Pain Points** | Harga mahal, kualitas kursus tidak konsisten, tidak ada interaksi dengan instructor |
| **Solusi** | Review & rating, Q&A dengan instructor, video preview gratis, sertifikat kelulusan |

### 3.2 Instructor (Pengajar)
| Atribut | Detail |
|---------|--------|
| **Tipe** | Content creator / pengajar |
| **Kebutuhan** | Membuat & mengelola kursus, berinteraksi dengan siswa, mendapatkan penghasilan |
| **Pain Points** | Tools pembuatan kursus rumit, payout tidak jelas, kurang exposure |
| **Solusi** | Dashboard instructor, analytics, coupon system, announcement tools |

### 3.3 Admin (Platform)
| Atribut | Detail |
|---------|--------|
| **Tipe** | Pengelola platform |
| **Kebutuhan** | Moderasi konten, verifikasi instructor, manajemen kategori, monitoring transaksi |
| **Pain Points** | Konten spam/plagiat, transaksi bermasalah, payout manual |
| **Solusi** | Admin dashboard langsung dari PocketBase |

---

## 4. Fitur — Role Student

### 4.1 🔐 Autentikasi & Akun
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| S-01 | **Register** | Daftar dengan email/password atau Google/GitHub OAuth | `users` |
| S-02 | **Login** | Login via credentials atau OAuth | `users` |
| S-03 | **Logout** | Hapus session JWT | - |
| S-04 | **Lupa Password** | Reset password via email | `users` |
| S-05 | **Profil** | Edit nama, avatar, bio, social links | `users` |
| S-06 | **Setting Akun** | Ganti email, password | `users` |

### 4.2 🏠 Halaman Utama (Home)
| # | Fitur | Deskripsi |
|---|-------|-----------|
| S-07 | **Hero Section** | Banner utama dengan CTA daftar/login |
| S-08 | **Kategori Populer** | Grid kategori kursus (Web Dev, Mobile, dll) |
| S-09 | **Kursus Unggulan** | Slider kursus `is_featured = true` |
| S-10 | **Kursus Terbaru** | Daftar kursus terbaru yang published |
| S-11 | **Kursus Terpopuler** | Sortir berdasarkan `total_students` |
| S-12 | **Rating Tertinggi** | Sortir berdasarkan `average_rating` |
| S-13 | **Search Bar** | Pencarian global (judul, instructor, tag) |

### 4.3 🔍 Jelajahi & Cari Kursus
| # | Fitur | Deskripsi |
|---|-------|-----------|
| S-14 | **Halaman Courses** | List semua kursus published |
| S-15 | **Filter** | Berdasarkan kategori, level, harga (gratis/berbayar), rating, bahasa |
| S-16 | **Sort** | Terbaru, terpopuler, rating tertinggi, harga termurah-termahal |
| S-17 | **Search** | Pencarian berdasarkan judul, subtitle, instructor, tags |
| S-18 | **Pagination** | Load more / infinite scroll |

### 4.4 📄 Detail Kursus
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| S-19 | **Informasi Kursus** | Thumbnail, judul, subtitle, rating, jumlah siswa, instructor, harga, diskon | `courses` |
| S-20 | **Preview Video** | Trailer / video gratis (`is_free_preview = true`) | `lectures` |
| S-21 | **Kurikulum** | List section & lecture (expandable) | `sections`, `lectures` |
| S-22 | **Yang Akan Dipelajari** | `what_you_will_learn` | `courses` |
| S-23 | **Prasyarat** | `requirements` | `courses` |
| S-24 | **Target Peserta** | `target_audience` | `courses` |
| S-25 | **Deskripsi** | Deskripsi lengkap kursus | `courses` |
| S-26 | **Review & Rating** | List ulasan + rata-rata rating | `reviews` |
| S-27 | **Instructor Info** | Profil instructor (nama, bio, avatar, jumlah siswa, jumlah kursus) | `users` |
| S-28 | **Wishlist Button** | Tambah/hapus dari wishlist | `wishlists` |
| S-29 | **Share** | Share link kursus ke sosial media | - |
| S-30 | **Cek Harga** | Tampilkan harga normal, diskon, dan hematnya | `courses.price`, `discount_price` |
| S-31 | **Beli Sekarang** | Tombol checkout → redirect ke pembayaran | - |
| S-32 | **Kupon** | Input kode kupon untuk diskon | `coupons` |

### 4.5 🎬 Learning — My Learning (Belajar)
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| S-33 | **My Courses** | Daftar kursus yang sudah dibeli + progress bar | `enrollments` |
| S-34 | **Course Player** | Halaman belajar utama (video player + sidebar) | - |
| S-35 | **Video Player** | Player video dengan multi-quality (`video_qualities`) | `lectures` |
| S-36 | **Auto-resume** | Lanjut dari posisi terakhir (`last_position`) | `lecture_progress` |
| S-37 | **Tracking Progress** | Otomatis update `watch_time` & `completed` per lecture | `lecture_progress` |
| S-38 | **Progress Bar** | Progress keseluruhan kursus di sidebar | `enrollments.progress` |
| S-39 | **Sidebar Kurikulum** | Navigasi antar section & lecture + status centang | `sections`, `lectures`, `lecture_progress` |
| S-40 | **Playback Speed** | Kontrol kecepatan video (0.5x — 2x) | - |
| S-41 | **Fullscreen** | Tombol fullscreen | - |
| S-42 | **Mark Complete** | Tandai lecture selesai manual | `lecture_progress.completed` |
| S-43 | **Article Reader** | Tampilan untuk lecture tipe `article` | `lectures.article_content` |
| S-44 | **Resource Download** | Download file pendukung | `lectures.resource_file` |

### 4.6 📝 Catatan (Notes)
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| S-45 | **Buat Catatan** | Tambah catatan di lecture tertentu | `notes` |
| S-46 | **Timestamp** | Catatan otomatis menyimpan posisi video (detik) | `notes.timestamp` |
| S-47 | **Edit/Hapus Catatan** | Kelola catatan | `notes` |
| S-48 | **List Catatan** | Lihat semua catatan per kursus | `notes` |
| S-49 | **Jump-to-position** | Klik timestamp → lompat ke posisi video | - |

### 4.7 💬 Q&A (Tanya Jawab)
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| S-50 | **Buat Pertanyaan** | Tanya tentang kursus / lecture tertentu | `qa_threads` |
| S-51 | **Jawab Pertanyaan** | Student bisa saling jawab | `qa_answers` |
| S-52 | **Mark Resolved** | Tandai pertanyaan selesai terjawab | `qa_threads.is_resolved` |
| S-53 | **Instructor Reply** | Jawaban instructor ditandai khusus | `qa_answers.is_instructor_reply` |
| S-54 | **Filter Q&A** | Semua, belum terjawab, sudah terjawab | - |

### 4.8 ⭐ Review & Rating
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| S-55 | **Beri Rating** | Rating 1-5 bintang | `reviews.rating` |
| S-56 | **Tulis Ulasan** | Komentar teks | `reviews.comment` |
| S-57 | **Edit/Hapus Review** | Kelola review sendiri | `reviews` |
| S-58 | **Hanya Bisa Sekali** | 1 review per student per course (unique index) | `(student, course)` unique |

### 4.9 💖 Wishlist
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| S-59 | **Tambah Wishlist** | Simpan kursus untuk nanti | `wishlists` |
| S-60 | **Hapus Wishlist** | Hapus dari wishlist | `wishlists` |
| S-61 | **Halaman Wishlist** | Lihat semua kursus yang di-wishlist | `wishlists` |
| S-62 | **Move to Cart** | Pindahkan wishlist ke checkout | - |

### 4.10 🛒 Checkout & Pembayaran
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| S-63 | **Halaman Checkout** | Ringkasan pesanan, harga, kupon | `courses` |
| S-64 | **Terapkan Kupon** | Masukkan kode diskon | `coupons` |
| S-65 | **Pilih Pembayaran** | Midtrans: GoPay, OVO, Bank Transfer, Kartu Kredit, dll | - |
| S-66 | **Proses Pembayaran** | Redirect ke Midtrans Snap | `transactions` |
| S-67 | **Callback** | Update status pembayaran dari Midtrans | `transactions.status` |
| S-68 | **Enroll Otomatis** | Setelah success → buat enrollment | `enrollments` |
| S-69 | **Riwayat Transaksi** | Semua transaksi yang pernah dilakukan | `transactions` |

### 4.11 📜 Sertifikat
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| S-70 | **Dapatkan Sertifikat** | Otomatis terbit saat kursus 100% selesai | `certificates` |
| S-71 | **Lihat Sertifikat** | Halaman detail sertifikat | `certificates` |
| S-72 | **Download PDF** | Download / print sertifikat | `certificates.certificate_url` |
| S-73 | **Nomor Sertifikat Unik** | Setiap sertifikat punya nomor unik | `certificates.certificate_number` |

---

## 5. Fitur — Role Instructor

### 5.1 📊 Instructor Dashboard
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| I-01 | **Overview** | Total siswa, total revenue, rating rata-rata | Aggregasi |
| I-02 | **Kursus Saya** | Semua kursus milik instructor | `courses` |
| I-03 | **Revenue** | Grafik pendapatan per bulan | `transactions` |
| I-04 | **Recent Reviews** | Ulasan terbaru dari siswa | `reviews` |
| I-05 | **Recent Q&A** | Pertanyaan yang belum terjawab | `qa_threads` |

### 5.2 📝 Manajemen Kursus
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| I-06 | **Buat Kursus Baru** | Form pembuatan kursus | `courses` |
| I-07 | **Edit Kursus** | Edit semua field kursus | `courses` |
| I-08 | **Upload Thumbnail** | Upload gambar thumbnail | `courses.thumbnail` |
| I-09 | **Set Harga** | Harga normal, diskon, gratis | `courses.price`, `discount_price` |
| I-10 | **Set Level** | Beginner, Intermediate, Advanced, All | `courses.level` |
| I-11 | **Pilih Kategori** | Kaitkan dengan kategori | `courses.category` |
| I-12 | **Tags** | Tambah tags (JSON array) | `courses.tags` |
| I-13 | **Publish / Draft** | Ubah status kursus | `courses.status` |

### 5.3 📚 Manajemen Kurikulum
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| I-14 | **Tambah Section** | Buat bab baru | `sections` |
| I-15 | **Edit/Hapus Section** | Kelola bab | `sections` |
| I-16 | **Reorder Section** | Drag & drop urutan bab | `sections.sort_order` |
| I-17 | **Tambah Lecture** | Video, artikel, quiz, coding exercise, resource | `lectures` |
| I-18 | **Upload Video** | Upload video → simpan URL / multi-quality | `lectures.video_url` |
| I-19 | **Tulis Artikel** | Editor rich-text untuk lecture artikel | `lectures.article_content` |
| I-20 | **Upload Resource** | File pendukung (PDF, ZIP, dll) | `lectures.resource_file` |
| I-21 | **Set Free Preview** | Tandai lecture gratis untuk preview | `lectures.is_free_preview` |
| I-22 | **Reorder Lecture** | Drag & drop urutan materi | `lectures.sort_order` |
| I-23 | **Publish/Unpublish Lecture** | Atur status per lecture | `lectures.is_published` |

### 5.4 💬 Interaksi dengan Siswa
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| I-24 | **Jawab Q&A** | Jawab pertanyaan siswa (tertanda instructor) | `qa_answers` |
| I-25 | **Buat Pengumuman** | Kirim pengumuman ke semua siswa di kursus | `announcements` |
| I-26 | **Lihat Daftar Siswa** | Siapa saja yang enrolled | `enrollments` |

### 5.5 💰 Kupon & Promo
| # | Fitur | Deskripsi | Koleksi DB |
|---|-------|-----------|------------|
| I-27 | **Buat Kupon** | Kode diskon untuk kursus | `coupons` |
| I-28 | **Tipe Diskon** | Percentage (%) atau Fixed (Rp) | `coupons.discount_type` |
| I-29 | **Batas Pemakaian** | Maksimal penggunaan kupon | `coupons.max_uses` |
| I-30 | **Masa Berlaku** | Tanggal kadaluarsa | `coupons.expires_at` |

### 5.6 📈 Analytics
| # | Fitur | Deskripsi |
|---|-------|-----------|
| I-31 | **Course Performance** | Views, enrolls, revenue per kursus |
| I-32 | **Student Demographics** | Level, lokasi siswa |
| I-33 | **Lecture Engagement** | Rata-rata watch time per lecture, drop-off point |

---

## 6. Fitur — Role Admin

### 6.1 🔐 Manajemen Pengguna
| # | Fitur | Deskripsi |
|---|-------|-----------|
| A-01 | **Verifikasi Instructor** | Approve/reject permohonan jadi instructor |
| A-02 | **Suspend/Ban User** | Blokir akun melanggar aturan |
| A-03 | **Manage Role** | Ubah role user (student → instructor → admin) |

### 6.2 📁 Manajemen Konten
| # | Fitur | Deskripsi |
|---|-------|-----------|
| A-04 | **Review Kursus** | Cek kursus sebelum publish |
| A-05 | **Reported Content** | Moderasi konten yang dilaporkan |
| A-06 | **Kelola Kategori** | CRUD kategori kursus |
| A-07 | **Featured Courses** | Set kursus unggulan (`is_featured`) |

### 6.3 💳 Manajemen Transaksi
| # | Fitur | Deskripsi |
|---|-------|-----------|
| A-08 | **Semua Transaksi** | Lihat & filter semua transaksi |
| A-09 | **Refund** | Proses refund pembayaran |
| A-10 | **Payout Instructor** | Rekonsiliasi payout ke instructor |

---

## 7. Fitur Lintas Role

### 7.1 🔔 Notifikasi (Future Enhancement)
| # | Fitur | Deskripsi |
|---|-------|-----------|
| N-01 | **Email Notif** | Transaksi berhasil, kursus baru, Q&A terjawab |
| N-02 | **In-App Notification** | Bell icon notifikasi di navbar |
| N-03 | **Push Notification** | Untuk mobile web |

### 7.2 📱 Responsive Design
| # | Fitur | Deskripsi |
|---|-------|-----------|
| R-01 | **Desktop** | Layout penuh (≥1024px) |
| R-02 | **Tablet** | Layout adaptif (768-1023px) |
| R-03 | **Mobile** | Layout stacked, hamburger menu (<768px) |

### 7.3 🌐 Multi Bahasa (Future)
| # | Fitur | Deskripsi |
|---|-------|-----------|
| L-01 | **Konten Multi Bahasa** | Instructor bisa buat kursus dalam berbagai bahasa |
| L-02 | **UI Lokalisasi** | Bahasa Indonesia (default) + Inggris |

---

## 8. Alur Pembayaran

### 8.1 Flow Checkout & Enroll
```
Student klik "Beli Sekarang"
        │
        ▼
Masuk halaman checkout (ringkasan pesanan, kupon)
        │
        ▼
Input kode kupon (opsional)
        │
        ▼
Pilih metode pembayaran → Redirect ke Midtrans Snap
        │
        ▼
Transaksi pending → Midtrans callback
        │
        ├── Success → Buat Enrollment → Redirect ke My Learning
        │
        ├── Failed  → Tampilkan error, retry
        │
        └── Expired → Status expired
```

### 8.2 Tabel Status Transaksi
| Status | Arti | Aksi Sistem |
|--------|------|-------------|
| `pending` | Menunggu pembayaran | - |
| `success` | Pembayaran berhasil | Buat `enrollments`, kirim email |
| `failed` | Pembayaran gagal | Tampilkan error ke user |
| `refunded` | Admin melakukan refund | Hapus `enrollments` terkait |

### 8.3 Penerapan Kupon
```
Harga Kursus: Rp 200.000
Kupon: "HEMAT50" (discount_type: percentage, discount_value: 50)

Perhitungan:
  Diskon    = 50% × Rp 200.000 = Rp 100.000
  Total     = Rp 200.000 - Rp 100.000 = Rp 100.000
  Biaya     = Fee platform (misal 10% dari harga setelah diskon)
  Instructor Share = Rp 100.000 - Biaya
```

---

## 9. Struktur Halaman (Sitemap)

### 9.1 Public Pages (Tidak Perlu Login)
```
/                               → Home (hero, kategori, kursus unggulan)
/courses                        → Jelajahi semua kursus (filter, sort, search)
/courses/[slug]                 → Detail kursus, preview, review, kurikulum
/auth/login                     → Halaman login
/auth/register                  → Halaman daftar
/auth/error                     → Halaman error auth
/auth/forgot-password           → Lupa password
/instructor/register            → Daftar jadi instructor
```

### 9.2 Protected Pages (Perlu Login — Student)
```
/my-learning                    → Daftar kursus yang dibeli
/my-learning/[courseId]         → Course player (video, artikel, dll)
/wishlist                       → Daftar wishlist
/checkout/[courseId]            → Halaman checkout
/transactions                   → Riwayat transaksi
/certificates                   → Sertifikat saya
/settings/profile               → Edit profil
/settings/account               → Setting akun (email, password)
```

### 9.3 Protected Pages (Perlu Login — Instructor)
```
/instructor/dashboard           → Dashboard overview
/instructor/courses             → Manajemen kursus
/instructor/courses/new         → Buat kursus baru
/instructor/courses/[courseId]/edit       → Edit kursus
/instructor/courses/[courseId]/curriculum → Kurikulum (section + lecture)
/instructor/courses/[courseId]/qa         → Q&A dari siswa
/instructor/courses/[courseId]/announcements → Pengumuman
/instructor/courses/[courseId]/students   → Daftar siswa
/instructor/coupons             → Manajemen kupon
/instructor/revenue             → Pendapatan & payout
```

### 9.4 Admin Pages (Via PocketBase Dashboard)
```
/_/                             → PocketBase admin dashboard
  └── Collections               → CRUD semua koleksi
  └── Users                     → Manajemen user & role
  └── Transactions              → Monitoring transaksi & refund
```

---

## 10. Prioritas Pengembangan

### 🚀 Phase 1: Foundation (MVP) — ✅ Selesai
| Fitur | Status | Notes |
|-------|--------|-------|
| Setup project (Next.js + PocketBase + Docker) | ✅ Selesai | Monorepo Bun, PocketBase 0.38 |
| Database migration & 15 collections | ✅ Selesai | Migrasi otomatis + seed 2 kursus |
| Autentikasi (Login, Register, Forgot Password) | ✅ Selesai | PocketBase native auth, email verification |
| Halaman Home & Course Listing | ✅ Selesai | Hero, kategori, filter, search, sort |
| Halaman Detail Kursus | ✅ Selesai | Kurikulum, review, pricing CTA |
| Checkout & Enroll | ✅ Selesai | Kupon, free enroll, paid placeholder |
| My Learning & Course Player | ✅ Selesai | Video player, mark complete, sidebar |
| Proxy middleware | ✅ Selesai | Next.js 16 proxy, PocketBase cookie |
| Bun test runner | ✅ Selesai | bunfig.toml, @testing-library/react |

### 🚀 Phase 2: Interaksi & Pembayaran — ✅ Selesai
| Fitur | Status | Notes |
|-------|--------|-------|
| Review & Rating | ✅ Selesai | Star rating + komentar, duplicate check |
| Wishlist | ✅ Selesai | Toggle di detail, `/wishlist` page |
| Q&A Forum | ✅ Selesai | Thread, jawaban, filter, resolved |
| Lecture Progress Tracking | ✅ Selesai | Auto-track, mark complete, overall progress |
| Catatan (Notes) | ✅ Selesai | CRUD per lecture, timestamp, jump-to-position |
| Midtrans Payment | ✅ Selesai | Snap popup, callback, auto-enroll |
| Riwayat Transaksi | ✅ Selesai | `/transactions` page with status badges |
| Sertifikat | ✅ Selesai | Auto-generate on 100%, `/certificates` page |

### 🚀 Phase 3: Instructor Tools — Prioritas Sedang
| Fitur | Estimasi | Dependencies |
|-------|----------|--------------|
| Instructor Dashboard | ⬜ | Phase 1 |
| Course Creator (CRUD) | ⬜ | Phase 1 |
| Curriculum Builder | ⬜ | Phase 1 |
| Coupon Management | ⬜ | Phase 1 |
| Announcements | ⬜ | Phase 1 |

### 🚀 Phase 4: Growth — Prioritas Rendah
| Fitur | Estimasi | Dependencies |
|-------|----------|--------------|
| Sertifikat Kelulusan | ⬜ | Phase 2 |
| Multi-quality Video | ⬜ | Phase 2 |
| Advanced Analytics | ⬜ | Phase 3 |
| Notifications | ⬜ | Phase 2 |
| Mobile Responsive Polish | ⬜ | Phase 1 |

---

## 📊 Ringkasan Fitur per Koleksi DB

| Koleksi DB | Fitur Terkait | # Fitur |
|------------|---------------|---------|
| `users` | Register, login, profil, instructor profile | 6 |
| `categories` | Kategori kursus, filter | 2 |
| `courses` | CRUD kursus, detail, search, filter, sort, pricing | 20+ |
| `sections` | Kurikulum, drag-drop reorder | 4 |
| `lectures` | Video player, article, resource, free preview, multi-quality | 10+ |
| `enrollments` | My learning, progress bar, payment status | 4 |
| `lecture_progress` | Tracking progress, auto-resume, watch time | 4 |
| `reviews` | Rating bintang, ulasan teks | 4 |
| `wishlists` | Simpan kursus, halaman wishlist | 4 |
| `qa_threads` | Forum tanya jawab per kursus | 4 |
| `qa_answers` | Jawaban, instructor reply | 3 |
| `coupons` | Kode diskon, batas pemakaian, kadaluarsa | 5 |
| `transactions` | Checkout, Midtrans, riwayat transaksi | 6 |
| `certificates` | Sertifikat kelulusan, download PDF | 4 |
| `notes` | Catatan per lecture, timestamp video | 5 |
| `announcements` | Pengumuman instructor ke siswa | 2 |

---

## 📝 Catatan Perubahan

| Tanggal | Versi | Perubahan | Author |
|---------|-------|-----------|--------|
| 18 Mei 2026 | 1.0 | Initial PRD document | - |
