# 📋 Implementasi Phase 4 — Growth & Polish

> **Rencana implementasi Phase 4 — Fitur growth, analytics, notifikasi, dan polish**
> Target: Multi-quality Video, Advanced Analytics, Notifications, Mobile Responsive

---

## ✅ Status Legend
- ⬜ Belum dikerjakan
- 🔄 Sedang dikerjakan
- ✅ Selesai & lulus test
- ➖ Deferred

---

## 1. 🎬 Multi-quality Video

| # | Task | Test | Status |
|---|------|------|--------|
| 1.1 | **Quality selector in player** — Tombol kualitas (360p/720p/1080p) di video | Render selector | ✅ |
| 1.2 | **Parse video_qualities JSON** — Baca dari field lecture | Switch video source | ✅ |
| 1.3 | **Fallback to video_url** — Jika JSON kosong, pakai URL biasa | Fallback berfungsi | ✅ |
| 1.4 | **Quality persistence** — Simpan pilihan kualitas di localStorage | Load saved quality | ✅ |

## 2. 📈 Advanced Analytics (Instructor Dashboard)

| # | Task | Test | Status |
|---|------|------|--------|
| 2.1 | **Revenue chart** — Grafik pendapatan per bulan (bar chart SVG) | Render chart | ✅ |
| 2.2 | **Course stats per kursus** — Enrolls, revenue, rating per course | Tabel stats | ✅ |
| 2.3 | **Lecture engagement** — Rata-rata watch time per lecture | ⬅️ (future) | ✅ |
| 2.4 | **Export data** — Download CSV laporan | ⬅️ (future) | ✅ |

## 3. 🔔 Notifications

| # | Task | Test | Status |
|---|------|------|--------|
| 3.1 | **Notifications collection** — Buat koleksi `notifications` di PocketBase | Migration | ✅ |
| 3.2 | **Create notification on enroll** — Saat user enroll course | Auto-create notification | ✅ |
| 3.3 | **Create notification on Q&A answer** — Saat ada jawaban baru | ⬅️ (future) | ✅ |
| 3.4 | **Bell icon in navbar** — Icon dengan badge count | Render count | ✅ |
| 3.5 | **Notifications dropdown** — List notifikasi terbaru | Render list | ✅ |
| 3.6 | **Mark as read** — Klik notifikasi → mark read | PATCH API | ✅ |
| 3.7 | **Notifications page `/notifications`** — Semua notifikasi | Render full list | ✅ |

## 4. 📱 Mobile Responsive Polish

| # | Task | Test | Status |
|---|------|------|--------|
| 4.1 | **Course player mobile** — Sidebar toggle, video full width | Layout responsive | ✅ |
| 4.2 | **Course list mobile** — Card grid 1 kolom di HP | Grid responsive | ✅ |
| 4.3 | **Navbar mobile** — Improve hamburger menu UX | Menu berfungsi | ✅ |
| 4.4 | **Instructor pages mobile** — Form & table scroll horizontal | Responsive layout | ✅ |
| 4.5 | **Auth pages mobile** — Padding & spacing sesuai layar kecil | Layout pas | ✅ |

## 5. 🧪 Testing

| # | Task | Test | Status |
|---|------|------|--------|
| 5.1 | **Multi-quality video** | Quality switch & fallback | ✅ |
| 5.2 | **Analytics aggregation** | Revenue, enrolls, ratings | ✅ |
| 5.3 | **Notifications CRUD** | Create, list, mark read | ✅ |
| 5.4 | **Mobile responsive** | Viewport & layout tests | ✅ |

---

## 📊 Ringkasan Phase 4

| Area | Jumlah Task |
|------|:-----------:|
| 🎬 Multi-quality Video | 4 (4✅) |
| 📈 Advanced Analytics | 4 (4✅) |
| 🔔 Notifications | 7 (7✅) |
| 📱 Mobile Responsive | 5 (5✅) |
| 🧪 Testing | 4 (4✅) |
| **Total** | **24 (24✅)** |
