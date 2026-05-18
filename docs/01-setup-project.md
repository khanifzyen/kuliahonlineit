# 📚 KuliahOnlineIT - Setup Project

> **Dokumentasi setup awal proyek KuliahOnlineIT**
> Tanggal: 18 Mei 2026
> Author: KuliahOnlineIT Team

---

## 📋 Daftar Isi

- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Monorepo](#struktur-monorepo)
- [Prasyarat](#prasyarat)
- [Langkah Setup](#langkah-setup)
  - [1. Clone atau Inisialisasi Project](#1-clone-atau-inisialisasi-project)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Setup Environment Variables](#3-setup-environment-variables)
  - [4. Jalankan PocketBase dengan Docker](#4-jalankan-pocketbase-dengan-docker)
  - [5. Setup Admin PocketBase](#5-setup-admin-pocketbase)
  - [6. Jalankan Migrasi Database](#6-jalankan-migrasi-database)
  - [7. Jalankan Aplikasi](#7-jalankan-aplikasi)
- [Cara Penggunaan Sehari-hari](#cara-penggunaan-sehari-hari)
- [Deployment dengan Docker](#deployment-dengan-docker)

---

## Teknologi yang Digunakan

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Bun** | ≥ 1.3 | Runtime JavaScript (pengganti Node.js) |
| **Next.js** | 16+ | React framework (Frontend + API) |
| **TailwindCSS** | 4+ | Utility-first CSS framework |
| **TypeScript** | 5+ | Type safety |
| **PocketBase** | latest | Backend as a Service (DB, Auth, Storage, API) |
| **PocketBase JS SDK** | 0.26+ | Client SDK untuk komunikasi dengan PocketBase |
| **NextAuth.js** | 4+ | Autentikasi (email, Google, GitHub) |
| **Midtrans** | latest | Payment Gateway Indonesia |
| **Docker** | latest | Containerization & deployment |

---

## Struktur Monorepo

```
kuliahonlineit/
├── apps/
│   ├── web/                    # Next.js frontend & API
│   │   ├── src/
│   │   │   ├── app/            # App Router (pages & layouts)
│   │   │   │   ├── api/        # API routes
│   │   │   │   ├── auth/       # Halaman auth (login, register)
│   │   │   │   ├── courses/    # Halaman kursus
│   │   │   │   ├── my-learning/ # Kursus yang dibeli
│   │   │   │   └── ...
│   │   │   ├── components/     # React components
│   │   │   └── lib/            # Utility & config
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   └── migrations/             # PocketBase migrations (JS SDK)
│       └── src/
│           ├── index.ts        # Runner utama
│           ├── collections/    # Definisi koleksi database
│           └── seeds/          # Data awal (seed)
│
├── pocketbase/                 # Data PocketBase (volume Docker)
│   ├── data/                   # Database file
│   ├── public/                 # File publik
│   ├── hooks/                  # PocketBase hooks (JS)
│   └── migrations/             # Auto-generated migrations
│
├── docs/                       # Dokumentasi
│   ├── 01-setup-project.md     # Setup awal (ini)
│   └── 02-skema-database.md    # Skema database
│
├── docker-compose.yml          # Docker services
├── package.json                # Root workspace
├── .env                        # Environment variables
└── README.md                   # README utama
```

---

## Prasyarat

1. **Bun** — Runtime JavaScript
   ```bash
   curl -fsSL https://bun.sh/install | bash
   bun --version  # Minimal 1.3.x
   ```

2. **Docker & Docker Compose** — Untuk menjalankan PocketBase
   ```bash
   docker --version
   docker compose version
   ```

3. **Git** — Version control
   ```bash
   git --version
   ```

---

## Langkah Setup

### 1. Clone atau Inisialisasi Project

```bash
# Buat folder project
mkdir kuliahonlineit && cd kuliahonlineit

# Atau clone dari repository
# git clone https://github.com/username/kuliahonlineit.git
# cd kuliahonlineit
```

### 2. Install Dependencies

```bash
# Install dependencies root (workspaces) dan semua apps
bun install

# Atau install per workspace:
cd apps/web && bun install
cd ../migrations && bun install
cd ../..
```

### 3. Setup Environment Variables

Copy file `.env` yang sudah disediakan dan sesuaikan:

```bash
# Edit file .env
# POCKETBASE_URL, AUTH_SECRET, MIDTRANS keys, dll.
nano .env
```

### 4. Jalankan PocketBase dengan Docker

```bash
# Jalankan PocketBase di background
docker compose up -d

# Cek apakah PocketBase sudah running
docker compose ps

# Lihat logs
docker compose logs -f pocketbase
```

PocketBase akan berjalan di: **http://localhost:8090**

Dashboard admin: **http://localhost:8090/_/**

### 5. Setup Admin PocketBase

Buka `http://localhost:8090/_/` dan buat akun admin pertama:

- Email: `admin@kuliahonlineit.com`
- Password: `admin123456`

Atau melalui API:

```bash
curl -X POST http://localhost:8090/api/admins \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kuliahonlineit.com",
    "password": "admin123456",
    "passwordConfirm": "admin123456"
  }'
```

### 6. Jalankan Migrasi Database

```bash
# Pastikan PocketBase sudah running
# Jalankan migrasi dari folder migrations
bun run migrate

# Atau dari dalam apps/migrations:
cd apps/migrations && bun run start && cd ../..
```

Migrasi akan:
- Membuat semua koleksi database (categories, courses, sections, lectures, dll.)
- Menambahkan index dan rules untuk setiap koleksi
- Mengisi seed data (kategori awal)

### 7. Jalankan Aplikasi

```bash
# Dari root folder
bun run dev

# Atau dari apps/web
cd apps/web && bun run dev
```

Aplikasi akan berjalan di: **http://localhost:3000**

---

## Cara Penggunaan Sehari-hari

```bash
# Development
bun run dev              # Jalankan Next.js (frontend + API)
docker compose up -d     # Jalankan PocketBase

# Migration
bun run migrate          # Jalankan migrasi database

# PocketBase
docker compose logs -f   # Lihat logs PocketBase
docker compose down      # Stop PocketBase
docker compose up -d     # Start PocketBase lagi

# Lainnya
bun run build            # Build production
bun run lint             # Linting
```

---

## Deployment dengan Docker

Untuk production deployment di VPS:

```bash
# 1. Build Next.js
cd apps/web && bun run build

# 2. Buat Dockerfile untuk Next.js (belum termasuk, nanti dibuat)

# 3. Gunakan docker-compose.prod.yml untuk production
docker compose -f docker-compose.prod.yml up -d

# 4. Setup reverse proxy (Nginx/Traefik) untuk domain
# 5. Setup SSL dengan Let's Encrypt
# 6. Setup S3 storage di PocketBase untuk skala besar
```

---

## Catatan Penting

1. **PocketBase Auth vs NextAuth**:
   - NextAuth digunakan untuk session management (JWT)
   - PocketBase digunakan untuk user storage & authentication backend
   - Saat login, NextAuth mengautentikasi ke PocketBase lalu menyimpan session JWT

2. **File Storage**:
   - Development: menggunakan storage bawaan PocketBase
   - Production: bisa diarahkan ke S3 compatible storage
   - Video: untuk skala besar, gunakan layanan seperti Mux atau Cloudflare Stream

3. **Midtrans**:
   - Mode sandbox: `MIDTRANS_IS_PRODUCTION=false`
   - Mode production: `MIDTRANS_IS_PRODUCTION=true` + server key production

---
