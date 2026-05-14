import {
  DataVisibility,
  Prisma,
  TransactionStatus,
  TransactionType,
  VerificationAction,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { VAT_RATE } from "@/lib/constants";
import { writeAuditLog } from "@/lib/audit";

const dec = (n: number | string) => new Prisma.Decimal(n);

export async function getItemStockTotal(itemId: string) {
  const r = await prisma.inventoryBatch.aggregate({
    where: { itemId, remainingQuantity: { gt: 0 } },
    _sum: { remainingQuantity: true },
  });
  return r._sum.remainingQuantity ?? dec(0);
}

export async function createInbound(p: {
  itemId: string;
  quantity: number;
  supplier: string;
  unitPrice: number;
  performedAt: Date;
  invoiceUrl?: string | null;
  userId: string;
  roleSlug: string;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const qty = dec(p.quantity);
  if (qty.lte(0)) throw new Error("Jumlah harus lebih dari 0");
  const item = await prisma.inventoryItem.findUnique({ where: { id: p.itemId } });
  if (!item) throw new Error("Bahan tidak ditemukan");
  const cur = await getItemStockTotal(p.itemId);
  if (item.maxStock && cur.add(qty).gt(item.maxStock)) {
    throw new Error("Melebihi kapasitas maksimum stok");
  }
  const invTx = await prisma.inventoryTransaction.create({
    data: {
      type: TransactionType.INBOUND,
      status: TransactionStatus.PENDING_VERIFICATION,
      visibility: DataVisibility.PRIVATE,
      itemId: p.itemId,
      quantity: qty,
      supplier: p.supplier,
      unitPrice: dec(p.unitPrice),
      performedAt: p.performedAt,
      createdById: p.userId,
      invoiceUrl: p.invoiceUrl ?? undefined,
    },
  });
  await writeAuditLog({
    userId: p.userId,
    role: p.roleSlug,
    action: "INBOUND_DRAFT",
    entity: "InventoryTransaction",
    entityId: invTx.id,
    ip: p.ip,
    userAgent: p.userAgent,
    after: { itemId: p.itemId, quantity: p.quantity },
  });
  return invTx;
}

async function fifoDeduct(
  db: Prisma.TransactionClient,
  itemId: string,
  need: Prisma.Decimal,
) {
  const batches = await db.inventoryBatch.findMany({
    where: { itemId, remainingQuantity: { gt: 0 } },
    orderBy: { receivedAt: "asc" },
  });
  let remaining = need;
  const lines: { batchId: string; qty: Prisma.Decimal; unitCost: Prisma.Decimal }[] =
    [];
  for (const b of batches) {
    if (remaining.lte(0)) break;
    const take = Prisma.Decimal.min(b.remainingQuantity, remaining);
    lines.push({ batchId: b.id, qty: take, unitCost: b.unitCost });
    remaining = remaining.sub(take);
  }
  if (remaining.gt(0)) throw new Error("Stok tidak mencukupi untuk FIFO");
  for (const line of lines) {
    await db.inventoryBatch.update({
      where: { id: line.batchId },
      data: { remainingQuantity: { decrement: line.qty } },
    });
  }
  return lines;
}

export async function createOutboundDraft(p: {
  itemId: string;
  quantity: number;
  type: "USAGE" | "WASTE";
  performedAt: Date;
  notes?: string | null;
  userId: string;
  roleSlug: string;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const need = dec(p.quantity);
  if (need.lte(0)) throw new Error("Jumlah harus lebih dari 0");
  const total = await getItemStockTotal(p.itemId);
  if (total.lt(need)) throw new Error("Stok tidak mencukupi");
  const item = await prisma.inventoryItem.findUnique({ where: { id: p.itemId } });
  if (!item) throw new Error("Bahan tidak ditemukan");
  const invTx = await prisma.inventoryTransaction.create({
    data: {
      type: p.type as TransactionType,
      status: TransactionStatus.PENDING_VERIFICATION,
      visibility: DataVisibility.PRIVATE,
      itemId: p.itemId,
      quantity: need,
      performedAt: p.performedAt,
      createdById: p.userId,
      notes: p.notes ?? undefined,
    },
  });
  await writeAuditLog({
    userId: p.userId,
    role: p.roleSlug,
    action: `${p.type}_DRAFT`,
    entity: "InventoryTransaction",
    entityId: invTx.id,
    ip: p.ip,
    userAgent: p.userAgent,
    after: { itemId: p.itemId, quantity: p.quantity },
  });
  return invTx;
}

export async function createReturnDraft(p: {
  itemId: string;
  quantity: number;
  reason: string;
  performedAt: Date;
  userId: string;
  roleSlug: string;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const oldest = await prisma.inventoryBatch.findFirst({
    where: { itemId: p.itemId },
    orderBy: { receivedAt: "asc" },
  });
  if (!oldest) throw new Error("Belum ada batch masuk");
  const hours =
    (p.performedAt.getTime() - oldest.receivedAt.getTime()) / (1000 * 60 * 60);
  if (hours > 24) {
    throw new Error("Return >24 jam — arahkan ke Waste");
  }
  const qty = dec(p.quantity);
  if (qty.lte(0)) throw new Error("Jumlah harus lebih dari 0");
  const invTx = await prisma.inventoryTransaction.create({
    data: {
      type: TransactionType.RETURN,
      status: TransactionStatus.PENDING_VERIFICATION,
      visibility: DataVisibility.PRIVATE,
      itemId: p.itemId,
      quantity: qty,
      performedAt: p.performedAt,
      createdById: p.userId,
      notes: p.reason,
    },
  });
  await writeAuditLog({
    userId: p.userId,
    role: p.roleSlug,
    action: "RETURN_DRAFT",
    entity: "InventoryTransaction",
    entityId: invTx.id,
    ip: p.ip,
    userAgent: p.userAgent,
  });
  return invTx;
}

export async function approveTransaction(p: {
  transactionId: string;
  userId: string;
  roleSlug: string;
  note?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const tx = await prisma.inventoryTransaction.findUnique({
    where: { id: p.transactionId },
  });
  if (!tx) throw new Error("Transaksi tidak ditemukan");
  if (tx.status !== TransactionStatus.PENDING_VERIFICATION) {
    throw new Error("Status tidak valid");
  }

  await prisma.$transaction(async (db) => {
    if (tx.type === TransactionType.INBOUND) {
      const uc = tx.unitPrice ?? dec(0);
      const batch = await db.inventoryBatch.create({
        data: {
          itemId: tx.itemId,
          batchNo: `B-${Date.now().toString(36).toUpperCase()}`,
          quantity: tx.quantity,
          remainingQuantity: tx.quantity,
          unitCost: uc,
          receivedAt: tx.performedAt,
          invoiceUrl: tx.invoiceUrl ?? undefined,
        },
      });
      await db.transactionBatchLine.create({
        data: {
          transactionId: tx.id,
          batchId: batch.id,
          quantity: tx.quantity,
          unitCost: uc,
        },
      });
    } else if (tx.type === TransactionType.USAGE || tx.type === TransactionType.WASTE) {
      const lines = await fifoDeduct(db, tx.itemId, tx.quantity);
      for (const line of lines) {
        await db.transactionBatchLine.create({
          data: {
            transactionId: tx.id,
            batchId: line.batchId,
            quantity: line.qty,
            unitCost: line.unitCost,
          },
        });
      }
      if (tx.type === TransactionType.WASTE) {
        let loss = dec(0);
        for (const line of lines) loss = loss.add(line.qty.mul(line.unitCost));
        await db.wasteLog.create({
          data: {
            itemId: tx.itemId,
            transactionId: tx.id,
            quantity: tx.quantity,
            reason: tx.notes ?? "Waste",
            lossValue: loss.add(loss.mul(dec(VAT_RATE))),
            createdById: tx.createdById,
          },
        });
      }
    } else if (tx.type === TransactionType.RETURN) {
      const avg = await db.inventoryBatch.aggregate({
        where: { itemId: tx.itemId },
        _avg: { unitCost: true },
      });
      const uc = avg._avg.unitCost ?? dec(0);
      const batch = await db.inventoryBatch.create({
        data: {
          itemId: tx.itemId,
          batchNo: `R-${Date.now().toString(36).toUpperCase()}`,
          quantity: tx.quantity,
          remainingQuantity: tx.quantity,
          unitCost: uc,
          receivedAt: tx.performedAt,
        },
      });
      await db.transactionBatchLine.create({
        data: {
          transactionId: tx.id,
          batchId: batch.id,
          quantity: tx.quantity,
          unitCost: uc,
        },
      });
    }

    await db.inventoryTransaction.update({
      where: { id: tx.id },
      data: {
        status: TransactionStatus.APPROVED,
        visibility: DataVisibility.PUBLIC,
        verifiedById: p.userId,
        verificationNote: p.note ?? null,
        approvedAt: new Date(),
      },
    });
    await db.verificationLog.create({
      data: {
        transactionId: tx.id,
        userId: p.userId,
        action: VerificationAction.APPROVE,
        note: p.note ?? undefined,
      },
    });
  });

  await writeAuditLog({
    userId: p.userId,
    role: p.roleSlug,
    action: "TRANSACTION_APPROVE",
    entity: "InventoryTransaction",
    entityId: tx.id,
    ip: p.ip,
    userAgent: p.userAgent,
  });
  return tx;
}

export async function rejectTransaction(p: {
  transactionId: string;
  userId: string;
  roleSlug: string;
  note: string;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const existing = await prisma.inventoryTransaction.findUnique({
    where: { id: p.transactionId },
  });
  if (!existing) throw new Error("Transaksi tidak ditemukan");
  if (existing.status !== TransactionStatus.PENDING_VERIFICATION) {
    throw new Error("Status tidak valid");
  }
  await prisma.$transaction(async (db) => {
    await db.inventoryTransaction.update({
      where: { id: p.transactionId },
      data: {
        status: TransactionStatus.REJECTED,
        visibility: DataVisibility.PRIVATE,
        verifiedById: p.userId,
        verificationNote: p.note,
        rejectedAt: new Date(),
      },
    });
    await db.verificationLog.create({
      data: {
        transactionId: p.transactionId,
        userId: p.userId,
        action: VerificationAction.REJECT,
        note: p.note,
      },
    });
  });
  await writeAuditLog({
    userId: p.userId,
    role: p.roleSlug,
    action: "TRANSACTION_REJECT",
    entity: "InventoryTransaction",
    entityId: p.transactionId,
    ip: p.ip,
    userAgent: p.userAgent,
  });
}
