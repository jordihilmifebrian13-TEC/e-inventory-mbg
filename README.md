# E-Inventory System MBG

Aplikasi web **fullstack** untuk pengelolaan inventori **Program Makan Bergizi Gratis (MBG)** pada lingkungan **SPPG**. Antarmuka modern (emerald / abu lembut), **dark mode**, responsif, dengan **RBAC**, **FIFO**, alur **verifikasi** Koordinator, **audit trail**, dan integrasi **Cloudflare Turnstile**.

![Screenshot placeholder](./docs/screenshot-placeholder.svg)

> Ganti gambar di atas dengan tangkapan layar nyata setelah deployment (simpan sebagai `docs/screenshot.png` dan perbarui path di README).

## Fitur utama

- **Inventori & FIFO**: batch stok, status kesegaran (segar / peringatan / kedaluwarsa), HPP berbasis batch.
- **Transaksi**: barang masuk, pemakaian, return (≤24 jam sejak batch tertua), waste (nilai kerugian + PPN 11%).
- **Verifikasi**: draft → approve (publik & terkunci) / reject dengan catatan revisi.
- **Dashboard peran**: kartu ringkasan, grafik pemakaian 7 hari, indikator online/offline.
- **Keamanan**: Auth.js JWT, bcrypt, batas gagal login, cookie aman, RBAC middleware, validasi Turnstile di server.
- **Hotline 127**: halaman khusus di menu dashboard.
- **Laporan & ekspor**: Excel (XLSX), CSV audit, cetak/PDF via browser.
- **Backup**: unduhan snapshot JSON + pencatatan job (admin).

## Tech stack

| Lapisan | Teknologi |
|---------|-----------|
| Frontend | Next.js 15 App Router, TypeScript, Tailwind, shadcn-style UI, Framer Motion, RHF + Zod, TanStack Table, Recharts, Lucide |
| Backend | Route Handlers, Prisma, PostgreSQL |
| Auth | Auth.js / NextAuth v5, sesi JWT |
| Bot | Cloudflare Turnstile |
| Deploy | Vercel-ready, Docker opsional |

## Struktur folder (clean architecture)

```
app/            # App Router, halaman & API routes
components/     # UI bersama & shell (sidebar, header, logo)
features/       # Modul fitur (dashboard, inventori, transaksi, …)
lib/            # utils, rbac, prisma singleton, konstanta
hooks/          # hooks React (online, idle logout, offline draft)
services/       # logika domain (FIFO, freshness)
prisma/         # schema & seed
docs/           # ERD, API, deployment
types/          # augmentasi TypeScript (NextAuth)
```

## Prasyarat

- **Node.js 20+** (disarankan 22)
- **PostgreSQL** 14+

## Setup lokal

```bash
cp .env.example .env
# Edit DATABASE_URL, AUTH_SECRET, kunci Turnstile (produksi)

npm install
npx prisma db push
npm run db:seed
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — akan diarahkan ke login.

### Akun demo (setelah seed)

| Peran | Username | Password |
|-------|----------|----------|
| Super Admin | `admin` | `Demo123!` |
| Koordinator | `koordinator` | `Demo123!` |
| Petugas Gudang | `gudang` | `Demo123!` |
| Petugas Gizi | `gizi` | `Demo123!` |
| Stok Auditor | `auditor` | `Demo123!` |

## Deploy

Lihat **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** (Vercel, env, `pg_dump`, Docker Compose).

## Dokumentasi tambahan

- **[docs/API.md](docs/API.md)** — ringkasan endpoint REST.
- **[docs/ERD.md](docs/ERD.md)** — diagram entitas.

## Lisensi & kontribusi

Proyek ini disiapkan untuk kebutuhan operasional MBG/SPPG. Sesuaikan kebijakan internal organisasi Anda sebelum produksi.
