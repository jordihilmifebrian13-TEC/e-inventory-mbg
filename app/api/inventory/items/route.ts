import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-user";
import { hasPermission } from "@/lib/rbac";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(user.roleSlug, "inventory:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
    include: {
      batches: {
        where: { remainingQuantity: { gt: 0 } },
        orderBy: { receivedAt: "asc" },
      },
    },
  });

  const payload = items.map((it) => {
    const onHand = it.batches.reduce(
      (a, b) => a + Number(b.remainingQuantity),
      0,
    );
    const min = Number(it.minStock);
    let indicator: "green" | "yellow" | "red" = "green";
    if (onHand <= 0) indicator = "red";
    else if (onHand <= min) indicator = "yellow";

    const avg =
      it.batches.length === 0
        ? 0
        : it.batches.reduce((a, b) => a + Number(b.unitCost), 0) /
          it.batches.length;

    return {
      id: it.id,
      name: it.name,
      sku: it.sku,
      category: it.category,
      unit: it.unit,
      minStock: min,
      onHand,
      indicator,
      avgUnitCost: avg,
      batches: it.batches.map((b) => ({
        id: b.id,
        batchNo: b.batchNo,
        remaining: Number(b.remainingQuantity),
        receivedAt: b.receivedAt,
        unitCost: Number(b.unitCost),
      })),
    };
  });

  return NextResponse.json({ items: payload });
}
