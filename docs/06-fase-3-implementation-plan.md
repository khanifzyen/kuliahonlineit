# 📋 Implementasi Phase 3 — Instructor Tools

> **Rencana implementasi Phase 3 — Tools untuk instructor**
> Target: Dashboard, Course Creator, Curriculum Builder, Coupon Management, Announcements

---

## ✅ Status Legend
- ⬜ Belum dikerjakan
- 🔄 Sedang dikerjakan
- ✅ Selesai & lulus test

---

## 0. ⚙️ Prasyarat
Phase 1 & 2 sudah selesai. Instructor pages akan di-protect oleh proxy dan hanya bisa diakses oleh user dengan role instructor atau pemilik kursus.

---

## 1. 📊 Instructor Dashboard (`/instructor/dashboard`)

| # | Task | Test | Status |
|---|------|------|--------|
| 1.1 | **Overview cards** — Total students, total revenue, avg rating, total courses | Aggregasi dari API | ✅ |
| 1.2 | **Kursus Saya** — List semua kursus milik instructor | Fetch by instructor field | ✅ |
| 1.3 | **Recent Reviews** — Ulasan terbaru dari siswa | Fetch reviews by course | ✅ |
| 1.4 | **Recent Q&A** — Pertanyaan yang belum terjawab | Fetch unanswered threads | ✅ |
| 1.5 | **Revenue chart** — Grafik pendapatan per bulan | ⬅️ (Phase 4) | ➖ |

## 2. 📝 Manajemen Kursus (`/instructor/courses`)

| # | Task | Test | Status |
|---|------|------|--------|
| 2.1 | **List kursus** — Semua kursus milik instructor dengan status | `courses` filter by instructor | ✅ |
| 2.2 | **Status badge** — Draft / Published / Archived | Badge warna berbeda | ✅ |
| 2.3 | **Tombol aksi** — Edit, Curriculum, hapus | Navigasi ke halaman masing-masing | ✅ |

## 3. 🆕 Buat Kursus Baru (`/instructor/courses/new`)

| # | Task | Test | Status |
|---|------|------|--------|
| 3.1 | **Form judul, slug, subtitle, deskripsi** | Input teks + editor | ✅ |
| 3.2 | **Upload thumbnail** | File upload ke PocketBase | ⬅️ (future) | ➖ |
| 3.3 | **Pilih kategori** | Dropdown dari categories collection | ✅ |
| 3.4 | **Set harga & diskon** | Input number | ✅ |
| 3.5 | **Set level** | Beginner / Intermediate / Advanced / All | ✅ |
| 3.6 | **What you'll learn, requirements, target audience** | Editor rich text | ✅ |
| 3.7 | **Save as draft / Publish** | Pilih status | ✅ |

## 4. ✏️ Edit Kursus (`/instructor/courses/[courseId]/edit`)

| # | Task | Test | Status |
|---|------|------|--------|
| 4.1 | **Edit form** — Sama seperti create, tapi pre-filled | Load data dari API | ✅ |
| 4.2 | **Update thumbnail** | Upload ulang | ⬅️ (future) | ➖ |
| 4.3 | **Change status** | Draft ↔ Published ↔ Archived | ✅ |
| 4.4 | **Delete course** | Hapus dengan konfirmasi | ✅ |

## 5. 📚 Curriculum Builder (`/instructor/courses/[courseId]/curriculum`)

| # | Task | Test | Status |
|---|------|------|--------|
| 5.1 | **List sections** — Dengan tombol tambah/edit/hapus | CRUD sections | ✅ |
| 5.2 | **Reorder sections** — Tombol naik/turun | Update sort_order | ✅ |
| 5.3 | **List lectures per section** — Expandable | Fetch lectures by section | ✅ |
| 5.4 | **Tambah lecture** — Form pilih tipe (video/article/resource) | CRUD lectures | ✅ |
| 5.5 | **Edit lecture** — Edit judul, URL, konten, dll | ⬅️ (future) | ➖ |
| 5.6 | **Delete lecture** — Hapus dengan konfirmasi | DELETE via API | ✅ |
| 5.7 | **Set free preview** — Toggle per lecture | Update is_free_preview | ✅ |
| 5.8 | **Reorder lectures** — Tombol naik/turun dalam section | Update sort_order | ✅ |

## 6. 📢 Announcements (`/instructor/courses/[courseId]/announcements`)

| # | Task | Test | Status |
|---|------|------|--------|
| 6.1 | **List announcements** — Semua pengumuman kursus | Fetch from API | ✅ |
| 6.2 | **Buat pengumuman baru** — Form judul + konten | POST ke announcements | ✅ |
| 6.3 | **Hapus pengumuman** — Hapus milik sendiri | DELETE via API | ✅ |

## 7. 👥 Daftar Siswa (`/instructor/courses/[courseId]/students`)

| # | Task | Test | Status |
|---|------|------|--------|
| 7.1 | **List enrolled students** — Nama, email, progress | Fetch enrollments + expand user | ✅ |
| 7.2 | **Progress per student** — % completion | From enrollments | ✅ |

## 8. 🏷️ Coupon Management (`/instructor/coupons`)

| # | Task | Test | Status |
|---|------|------|--------|
| 8.1 | **List coupons** — Semua kupon milik instructor | Fetch from API | ✅ |
| 8.2 | **Buat kupon baru** — Kode, tipe, nilai, kursus, batas, masa berlaku | POST ke coupons | ✅ |
| 8.3 | **Toggle aktif/nonaktif** — Update is_active | PATCH API | ✅ |
| 8.4 | **Hapus kupon** — DELETE | Konfirmasi | ✅ |

## 9. 🧪 Testing

| # | Task | Test | Status |
|---|------|------|--------|
| 9.1 | **Dashboard overview** | Aggregation data test | ✅ |
| 9.2 | **Course CRUD** | Create, edit, delete course | ✅ |
| 9.3 | **Curriculum builder** | Section & lecture CRUD | ✅ |
| 9.4 | **Coupon management** | CRUD coupon + toggle active | ✅ |
| 9.5 | **Announcements** | CRUD announcement | ✅ |
| 9.6 | **Route protection** | Non-instructor can't access | ✅ |

---

## 📊 Ringkasan Phase 3

| Area | Jumlah Task |
|------|:-----------:|
| 📊 Dashboard | 5 (4✅ 1➖) |
| 📝 Course Management | 3 (3✅) |
| 🆕 Create Course | 7 (6✅ 1➖) |
| ✏️ Edit Course | 4 (3✅ 1➖) |
| 📚 Curriculum Builder | 8 (7✅ 1➖) |
| 📢 Announcements | 3 (3✅) |
| 👥 Student List | 2 (2✅) |
| 🏷️ Coupon Management | 4 (4✅) |
| 🧪 Testing | 6 (6✅) |
| **Total** | **42 (38✅ 4➖ future)** |

---

## 🏗️ Structure Routes

```
/instructor/dashboard                        → Overview page
/instructor/courses                          → Course list
/instructor/courses/new                      → Create course
/instructor/courses/[courseId]/edit          → Edit course
/instructor/courses/[courseId]/curriculum    → Curriculum builder
/instructor/courses/[courseId]/announcements → Announcements
/instructor/courses/[courseId]/students      → Student list
/instructor/coupons                          → Coupon management
```
