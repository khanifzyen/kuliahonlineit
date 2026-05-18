# KuliahOnlineIT 🎓

Platform pembelajaran *online* — seperti Udemy/Coursera — yang dibangun dengan **Next.js 16**, **React 19**, **PocketBase**, dan **Midtrans**.

## ✨ Fitur Utama

- 🔐 **Autentikasi** — NextAuth v4 (Google, GitHub, credentials)
- 💳 **Pembayaran** — Midtrans payment gateway
- 🗄️ **Database & Storage** — PocketBase (real-time, built-in files)
- 🎥 **Video Pembelajaran** — Streaming dengan dukungan FFmpeg
- 📱 **Responsive** — Tailwind CSS v4
- 🔄 **Migrasi Database** — Scripted migrations & seeder

## 🏗️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Backend** | PocketBase (Go-based, embedded) |
| **Auth** | NextAuth v4 |
| **Payment** | Midtrans (Snap API) |
| **Package Manager** | Bun |
| **Container** | Docker (PocketBase) |

## 📁 Struktur Monorepo

```
kuliahonlineit/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/          # App Router pages & API routes
│   │   │   ├── lib/          # Shared utilities (auth, pocketbase, etc.)
│   │   │   └── middleware.ts # NextAuth middleware
│   │   └── ...
│   └── migrations/      # Database migration scripts
│       └── src/
│           ├── collections/  # Collection definitions
│           └── seeds/        # Seed data
├── docs/
│   ├── 01-setup-project.md
│   └── 02-skema-database.md
├── pocketbase/           # PocketBase config & data (gitignored)
├── docker-compose.yml    # PocketBase container
└── package.json          # Root workspace
```

## 🚀 Cara Menjalankan

### Prasyarat
- [Bun](https://bun.sh) v1.x
- [Docker](https://docker.com) & Docker Compose

### 1. Clone & Install

```bash
git clone https://github.com/khanifzyen/kuliahonlineit.git
cd kuliahonlineit
bun install
```

### 2. Setup Environment

```bash
cp .env .env.local
# Sesuaikan nilai variabel di .env.local
```

### 3. Jalankan PocketBase (Docker)

```bash
bun run docker:up
```

### 4. Jalankan Database Migration

```bash
bun run migrate
```

### 5. Jalankan Development Server

```bash
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000) 🚀

### Perintah Lainnya

| Perintah | Keterangan |
|---|---|
| `bun run build` | Build untuk production |
| `bun run lint` | ESLint check |
| `bun run docker:down` | Hentikan PocketBase |
| `bun run docker:logs` | Lihat log PocketBase |

## 📚 Dokumentasi

- [Setup Project](docs/01-setup-project.md)
- [Skema Database](docs/02-skema-database.md)

## 🌐 Environment Variables

| Variable | Deskripsi |
|---|---|
| `POCKETBASE_*` | Koneksi PocketBase |
| `AUTH_SECRET` | Secret NextAuth |
| `AUTH_URL` | URL aplikasi |
| `GOOGLE_*` / `GITHUB_*` | OAuth client ID & secret |
| `MIDTRANS_*` | Midtrans server & client key |
| `STORAGE_BUCKET` | Nama bucket storage |
| `NEXT_PUBLIC_*` | Variabel publik Next.js |

## 📄 Lisensi

Hak cipta © 2026 — Proyek internal.
