# 🗄️ KuliahOnlineIT - Skema Database

> **Dokumentasi skema database PocketBase untuk KuliahOnlineIT**
> Tanggal: 18 Mei 2026

---

## 📊 Diagram Relasi Database

```
users (PocketBase built-in)
  │
  ├──< courses              (instructor → user)
  ├──< enrollments          (student → user)
  ├──< lecture_progress     (student → user)
  ├──< reviews              (student → user)
  ├──< wishlists            (student → user)
  ├──< qa_threads           (student → user)
  ├──< qa_answers           (user → user)
  ├──< transactions         (student → user)
  ├──< certificates         (student → user)
  └──< notes                (student → user)

categories
  │
  └──< courses              (category)

courses
  │
  ├──< sections             (course)
  ├──< enrollments          (course)
  ├──< reviews              (course)
  ├──< wishlists            (course)
  ├──< qa_threads           (course)
  ├──< transactions         (course)
  ├──< certificates         (course)
  ├──< announcements        (course)
  └──< coupons              (course)

sections
  │
  └──< lectures             (section)

enrollments
  │
  ├──< lecture_progress     (enrollment)
  └──< certificates         (enrollment)
```

---

## 📦 Daftar Koleksi

### 1. `users` (Built-in PocketBase)

Koleksi bawaan PocketBase untuk menyimpan data user. Sudah ada secara default.

| Field | Type | Keterangan |
|-------|------|------------|
| `id` | text (auto) | Primary key |
| `email` | email | Email user |
| `password` | password | Hash password |
| `name` | text | Nama lengkap |
| `avatar` | file | Foto profil |
| `role` | select | `student`, `instructor`, `admin` |
| `bio` | editor | Biografi (khusus instructor) |
| `social_links` | json | Link sosial media |
| `created` | date (auto) | Tanggal daftar |
| `updated` | date (auto) | Tanggal update |

**Rules:**
- List: `@request.auth.id != ''`
- View: `@request.auth.id != ''`
- Create: (public - registrasi)
- Update: `id = @request.auth.id`

---

### 2. `categories` — Kategori Kursus

Menyimpan kategori utama untuk mengelompokkan kursus.

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `name` | text | ✅ | - | Nama kategori (ex: Web Development) |
| `slug` | text | ✅ | - | URL slug (ex: web-development) |
| `description` | text | ❌ | - | Deskripsi kategori |
| `icon` | text | ❌ | - | Icon (emoji atau URL) |
| `sort_order` | number | ❌ | 0 | Urutan tampilan |

**Index:** `slug` (unique)

**Rules:**
- List: authenticated
- Create: admin only
- Update: admin only
- Delete: admin only

---

### 3. `courses` — Kursus

Koleksi utama untuk data kursus.

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `title` | text | ✅ | - | Judul kursus |
| `slug` | text | ✅ | - | URL slug |
| `subtitle` | text | ❌ | - | Subjudul (1 kalimat) |
| `description` | editor | ❌ | - | Deskripsi lengkap |
| `thumbnail` | file | ❌ | - | Gambar thumbnail |
| `category` | relation (categories) | ❌ | - | Kategori |
| `instructor` | relation (users) | ✅ | - | Pengajar (pemilik kursus) |
| `price` | number | ✅ | 0 | Harga |
| `discount_price` | number | ❌ | - | Harga diskon |
| `level` | select | ❌ | `all` | `beginner`, `intermediate`, `advanced`, `all` |
| `language` | text | ❌ | `Indonesia` | Bahasa kursus |
| `duration` | number | ❌ | 0 | Total durasi (menit) |
| `status` | select | ✅ | `draft` | `draft`, `published`, `archived` |
| `is_featured` | bool | ❌ | false | Kursus unggulan |
| `total_lectures` | number | ❌ | 0 | Jumlah materi (auto) |
| `total_students` | number | ❌ | 0 | Jumlah siswa (auto) |
| `average_rating` | number | ❌ | 0 | Rating rata-rata (auto) |
| `tags` | json | ❌ | [] | Array tags |
| `requirements` | editor | ❌ | - | Prasyarat kursus |
| `what_you_will_learn` | editor | ❌ | - | Yang akan dipelajari |
| `target_audience` | editor | ❌ | - | Target peserta |

**Indexes:** `slug` (unique), `status`, `category`, `instructor`

**Rules:**
- List: authenticated
- Create: `instructor = @request.auth.id`
- Update: instructor or admin
- Delete: instructor or admin

---

### 4. `sections` — Bab/Bagian Kursus

Setiap kursus memiliki beberapa section (bab).

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `course` | relation (courses) | ✅ | - | Kursus induk |
| `title` | text | ✅ | - | Nama bab |
| `sort_order` | number | ✅ | 0 | Urutan bab |
| `description` | text | ❌ | - | Deskripsi bab |

**Indexes:** `course`, `(course, sort_order)`

**Rules:**
- Create: `course.instructor = @request.auth.id`
- Update: course instructor or admin
- Delete: course instructor or admin

---

### 5. `lectures` — Materi Pelajaran

Materi di dalam setiap section. Bisa berupa video, artikel, quiz, dsb.

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `section` | relation (sections) | ✅ | - | Section induk |
| `title` | text | ✅ | - | Judul materi |
| `description` | editor | ❌ | - | Deskripsi |
| `type` | select | ✅ | `video` | `video`, `article`, `quiz`, `coding_exercise`, `resource` |
| `video_url` | url | ❌ | - | URL video utama |
| `video_duration` | number | ❌ | 0 | Durasi video (detik) |
| `video_qualities` | json | ❌ | - | Multi quality: `{"360p":"url","720p":"url","1080p":"url"}` |
| `article_content` | editor | ❌ | - | Konten artikel |
| `resource_file` | file | ❌ | - | File pendukung (PDF, ZIP) |
| `is_free_preview` | bool | ❌ | false | Bisa ditonton gratis |
| `sort_order` | number | ✅ | 0 | Urutan dalam section |
| `is_published` | bool | ❌ | true | Status publish |

**Indexes:** `section`, `(section, sort_order)`

---

### 6. `enrollments` — Pendaftaran Kursus

Mencatat siapa saja yang terdaftar di kursus apa.

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `student` | relation (users) | ✅ | - | Siswa |
| `course` | relation (courses) | ✅ | - | Kursus |
| `progress` | number | ❌ | 0 | Progress (%) |
| `completed` | bool | ❌ | false | Sudah selesai? |
| `completed_at` | date | ❌ | - | Tanggal selesai |
| `payment_status` | select | ✅ | `pending` | `pending`, `success`, `failed`, `refunded` |
| `payment_method` | text | ❌ | - | Metode pembayaran |
| `payment_details` | json | ❌ | - | Detail pembayaran (Midtrans) |
| `certificate_url` | url | ❌ | - | Link sertifikat |

**Indexes:** `(student, course)` (unique), `student`, `course`

**Rules:**
- List: `student = @request.auth.id`
- Create: authenticated (setelah checkout sukses)

---

### 7. `lecture_progress` — Progress per Materi

Mencatat progress setiap siswa per lecture.

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `student` | relation (users) | ✅ | - | Siswa |
| `lecture` | relation (lectures) | ✅ | - | Materi |
| `enrollment` | relation (enrollments) | ✅ | - | Enrollment |
| `completed` | bool | ❌ | false | Selesai ditonton? |
| `watch_time` | number | ❌ | 0 | Total waktu nonton (detik) |
| `last_position` | number | ❌ | 0 | Posisi terakhir (detik) |

**Indexes:** `(student, lecture)` (unique), `enrollment`

---

### 8. `reviews` — Rating & Ulasan

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `course` | relation (courses) | ✅ | - | Kursus |
| `student` | relation (users) | ✅ | - | Pemberi review |
| `rating` | number | ✅ | - | Rating 1-5 |
| `comment` | editor | ❌ | - | Komentar |

**Indexes:** `(student, course)` (unique), `course`

---

### 9. `wishlists` — Wishlist / Simpan untuk Nanti

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `student` | relation (users) | ✅ | - | Siswa |
| `course` | relation (courses) | ✅ | - | Kursus |

**Indexes:** `(student, course)` (unique)

---

### 10. `qa_threads` — Forum Tanya Jawab

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `course` | relation (courses) | ✅ | - | Kursus |
| `lecture` | relation (lectures) | ❌ | - | Terkait materi tertentu |
| `student` | relation (users) | ✅ | - | Penanya |
| `title` | text | ✅ | - | Judul pertanyaan |
| `content` | editor | ✅ | - | Isi pertanyaan |
| `is_resolved` | bool | ❌ | false | Sudah terjawab? |

**Index:** `course`

---

### 11. `qa_answers` — Jawaban Q&A

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `thread` | relation (qa_threads) | ✅ | - | Thread induk |
| `user` | relation (users) | ✅ | - | Penjawab |
| `content` | editor | ✅ | - | Isi jawaban |
| `is_instructor_reply` | bool | ❌ | false | Jawaban instructor? |

**Index:** `thread`

---

### 12. `coupons` — Kupon Diskon

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `code` | text | ✅ | - | Kode kupon |
| `course` | relation (courses) | ❌ | - | Khusus kursus tertentu |
| `discount_type` | select | ✅ | - | `percentage` / `fixed` |
| `discount_value` | number | ✅ | - | Nilai diskon |
| `max_uses` | number | ❌ | - | Maksimal pemakaian |
| `current_uses` | number | ❌ | 0 | Sudah dipakai |
| `expires_at` | date | ❌ | - | Tanggal kadaluarsa |
| `is_active` | bool | ❌ | true | Aktif? |

**Index:** `code` (unique)

---

### 13. `transactions` — Riwayat Transaksi

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `student` | relation (users) | ✅ | - | Pembeli |
| `course` | relation (courses) | ✅ | - | Kursus |
| `enrollment` | relation (enrollments) | ❌ | - | Enrollment terkait |
| `amount` | number | ✅ | - | Harga kursus |
| `fee` | number | ❌ | 0 | Biaya platform |
| `total` | number | ✅ | - | Total dibayar |
| `currency` | text | ❌ | `IDR` | Mata uang |
| `payment_method` | text | ❌ | - | Metode bayar |
| `midtrans_order_id` | text | ❌ | - | Order ID Midtrans |
| `midtrans_transaction_id` | text | ❌ | - | Transaction ID Midtrans |
| `status` | select | ✅ | `pending` | `pending`, `success`, `failed`, `refunded` |
| `payment_details` | json | ❌ | - | Response Midtrans |

**Indexes:** `student`, `status`, `midtrans_order_id`

---

### 14. `certificates` — Sertifikat Kelulusan

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `student` | relation (users) | ✅ | - | Siswa |
| `course` | relation (courses) | ✅ | - | Kursus |
| `enrollment` | relation (enrollments) | ✅ | - | Enrollment |
| `certificate_number` | text | ✅ | - | Nomor sertifikat (unik) |
| `certificate_url` | url | ❌ | - | Link/PDF sertifikat |
| `issued_at` | date | ❌ | - | Tanggal terbit |

**Indexes:** `(student, course)` (unique), `certificate_number` (unique)

---

### 15. `notes` — Catatan Siswa

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `student` | relation (users) | ✅ | - | Siswa |
| `lecture` | relation (lectures) | ✅ | - | Materi terkait |
| `content` | editor | ✅ | - | Isi catatan |
| `timestamp` | number | ❌ | 0 | Timestamp video (detik) |

**Indexes:** `student`, `lecture`

---

### 16. `announcements` — Pengumuman Instructor

| Field | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `course` | relation (courses) | ✅ | - | Kursus |
| `title` | text | ✅ | - | Judul pengumuman |
| `content` | editor | ✅ | - | Isi pengumuman |

**Index:** `course`

---

## 🔐 Ringkasan Access Rules

| Koleksi | List | View | Create | Update | Delete |
|---------|------|------|--------|--------|--------|
| categories | auth | auth | admin | admin | admin |
| courses | auth | auth | instructor | instructor/admin | instructor/admin |
| sections | auth | auth | instructor | instructor/admin | instructor/admin |
| lectures | auth | auth | instructor | instructor/admin | instructor/admin |
| enrollments | own | own/instructor | auth | student | admin |
| lecture_progress | own | own | student | student | admin |
| reviews | auth | auth | auth | own/admin | own/admin |
| wishlists | own | own | student | student | own/admin |
| qa_threads | auth | auth | auth | own/admin | own/admin |
| qa_answers | auth | auth | auth | own/admin | own/admin |
| coupons | admin | instructor/admin | instructor/admin | instructor/admin | admin |
| transactions | own | own/instructor/admin | auth | admin | admin |
| certificates | own | own/instructor/admin | admin | admin | admin |
| notes | own | own | student | student | student |
| announcements | auth | auth | instructor | instructor/admin | instructor/admin |

**Keterangan:**
- `auth` = semua user yang sudah login
- `own` = hanya record milik sendiri (`@request.auth.id = field.user`)
- `instructor` = pemilik kursus terkait
- `admin` = hanya admin PocketBase

---

## 🚀 Cara Migrasi

Untuk menjalankan migrasi:

```bash
# Dari root project
bun run migrate

# Atau dari folder migrations
cd apps/migrations && bun run start
```

Migration script akan:
1. Connect ke PocketBase (via Admin API)
2. Cek koleksi mana yang sudah ada vs baru
3. Buat koleksi baru jika belum ada
4. Update koleksi yang sudah ada (schema & rules)
5. Seed data awal (kategori)

> **Catatan:** Migrasi menggunakan PocketBase JS SDK (`pocketbase` npm package), bukan file JSON di `pb_migrations`. Kita menggunakan SDK agar lebih fleksibel dan bisa pakai TypeScript.

---
