import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-user";
import { hasPermission } from "@/lib/rbac";
import { TransactionStatus } from "@prisma/client";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(user.roleSlug, "transactions:verify")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await prisma.inventoryTransaction.findMany({
    where: { status: TransactionStatus.PENDING_VERIFICATION },
    orderBy: { createdAt: "desc" },
    include: { item: true, createdBy: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ transactions: rows });
}
