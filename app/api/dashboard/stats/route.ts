import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-user";
import { TransactionStatus, TransactionType } from "@prisma/client";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [batchAgg, lowItems, wasteAgg, txToday, weekUsage] = await Promise.all([
    prisma.inventoryBatch.aggregate({
      where: { remainingQuantity: { gt: 0 } },
      _sum: { remainingQuantity: true },
    }),
    prisma.inventoryItem.findMany({
      include: {
        batches: {
          where: { remainingQuantity: { gt: 0 } },
        },
      },
    }),
    prisma.wasteLog.aggregate({ _sum: { quantity: true, lossValue: true } }),
    prisma.inventoryTransaction.count({
      where: {
        performedAt: { gte: startOfDay },
        status: TransactionStatus.APPROVED,
      },
    }),
    prisma.inventoryTransaction.findMany({
      where: {
        type: TransactionType.USAGE,
        status: TransactionStatus.APPROVED,
        performedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: { performedAt: true, quantity: true },
    }),
  ]);

  let lowStock = 0;
  for (const it of lowItems) {
    const sum = it.batches.reduce(
      (a, b) => a + Number(b.remainingQuantity),
      0,
    );
    if (sum <= Number(it.minStock)) lowStock += 1;
  }

  const weekMap: Record<string, number> = {};
  for (const u of weekUsage) {
    const d = u.performedAt.toISOString().slice(0, 10);
    weekMap[d] = (weekMap[d] ?? 0) + Number(u.quantity);
  }

  return NextResponse.json({
    totalStock: Number(batchAgg._sum.remainingQuantity ?? 0),
    lowStock,
    totalWasteQty: Number(wasteAgg._sum.quantity ?? 0),
    totalWasteLoss: Number(wasteAgg._sum.lossValue ?? 0),
    transactionsToday: txToday,
    weekUsage: Object.entries(weekMap).map(([date, qty]) => ({ date, qty })),
  });
}
