# ERD — E-Inventory System MBG

Diagram relasi utama (PostgreSQL + Prisma).

```mermaid
erDiagram
  USER ||--o{ INVENTORY_TRANSACTION : creates
  USER ||--o{ AUDIT_LOG : generates
  USER }o--|| ROLE : has
  ROLE ||--o{ ROLE_PERMISSION : maps
  PERMISSION ||--o{ ROLE_PERMISSION : maps

  INVENTORY_ITEM ||--o{ INVENTORY_BATCH : batches
  INVENTORY_ITEM ||--o{ INVENTORY_TRANSACTION : lines
  INVENTORY_BATCH ||--o{ TRANSACTION_BATCH_LINE : allocations
  INVENTORY_TRANSACTION ||--o{ TRANSACTION_BATCH_LINE : lines
  INVENTORY_TRANSACTION ||--o{ VERIFICATION_LOG : verified
  INVENTORY_TRANSACTION ||--o{ WASTE_LOG : optional
  USER ||--o{ NOTIFICATION : receives
  USER ||--o{ REPORT : generates
  USER ||--o{ BACKUP_JOB : creates
```

## Catatan FIFO

- Stok fisik di `inventory_batches.remaining_quantity`, diurutkan `received_at` untuk konsumsi keluar.
- Transaksi **keluar** (pemakaian / waste) membuat `transaction_batch_line` saat **approve**, setelah itu batch terupdate.
- Transaksi **masuk** membuat batch baru saat **approve**.
