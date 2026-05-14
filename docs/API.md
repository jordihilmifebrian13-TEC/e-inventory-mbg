# API — Ringkasan Route Handlers

Base URL: origin aplikasi (mis. `https://your-app.vercel.app`).

Autentikasi: cookie sesi Auth.js (JWT). Semua route di bawah `/api/*` (kecuali `/api/auth/*`) mengharuskan sesi valid — kirim cookie browser atau gunakan sesi yang sama.

## Auth

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET/POST | `/api/auth/*` | Auth.js — login, logout, session |

## Dashboard & inventori

| Method | Path | RBAC | Deskripsi |
|--------|------|------|-----------|
| GET | `/api/dashboard/stats` | Semua role terautentikasi | Ringkasan kartu dashboard |
| GET | `/api/inventory/items` | `inventory:read` | Daftar item + batch + indikator |

## Transaksi

| Method | Path | RBAC | Body (JSON) |
|--------|------|------|---------------|
| POST | `/api/transactions/inbound` | `transactions:create` | `itemId`, `quantity`, `supplier`, `unitPrice`, `performedAt` (ISO), `invoiceUrl?` |
| POST | `/api/transactions/usage` | `transactions:create` | `itemId`, `quantity`, `performedAt`, `notes?` |
| POST | `/api/transactions/waste` | `transactions:create` | `itemId`, `quantity`, `performedAt`, `reason` |
| POST | `/api/transactions/return` | `transactions:create` | `itemId`, `quantity`, `performedAt`, `reason` |
| GET | `/api/transactions/pending` | `transactions:verify` | — |
| POST | `/api/transactions/:id/approve` | `transactions:verify` | `{ note?: string \| null }` |
| POST | `/api/transactions/:id/reject` | `transactions:verify` | `{ note: string }` (min. 3 karakter) |

## Audit, pengguna, backup

| Method | Path | RBAC | Deskripsi |
|--------|------|------|-----------|
| GET | `/api/audit?take=50` | `audit:read` | Log audit terbaru |
| GET | `/api/users` | `users:manage` | Daftar pengguna |
| GET | `/api/backup/export` | `backup:run` | Unduhan snapshot JSON |
| POST | `/api/backup/export` | `backup:run` | Mencatat job backup manual |

## Kode error umum

- `401` — tidak terautentikasi
- `403` — tidak memiliki izin RBAC
- `400` — validasi / aturan bisnis (stok, return >24 jam, dll.)
