# Panduan deployment

## Prasyarat

- Node.js **20+** (disarankan 22 LTS)
- PostgreSQL 14+ (managed: Neon, Supabase, RDS, Cloud SQL, dll.)

## Variabel lingkungan

Lihat `.env.example`. Minimum produksi:

- `DATABASE_URL`
- `AUTH_SECRET` (string acak panjang)
- `AUTH_URL` / `NEXT_PUBLIC_APP_URL` — URL canonical aplikasi
- Cloudflare Turnstile: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`

## Database

```bash
npx prisma migrate deploy   # atau: prisma db push (dev)
npm run db:seed             # data demo (opsional)
```

## Build

```bash
npm ci
npm run build
npm start
```

## Vercel

1. Hubungkan repositori GitHub ke Vercel.
2. Set environment variables di dashboard Vercel (sama seperti `.env.example`).
3. Build command default `next build`, output `.next`.
4. Pastikan `prisma generate` berjalan — sudah ada di script `build` pada `package.json`.

## Cadangan database produksi

- Gunakan fitur backup otomatis penyedia PostgreSQL **dan/atau** `pg_dump` terjadwal.
- Endpoint JSON snapshot (`GET /api/backup/export`) untuk ringkasan cepat, **bukan** pengganti dump penuh.

## Docker (opsional)

Lihat `Dockerfile` dan `docker-compose.yml` di root proyek untuk menjalankan app + Postgres lokal.
