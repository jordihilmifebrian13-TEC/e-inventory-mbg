import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-user";
import { hasPermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(user.roleSlug, "backup:run")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [users, items, txs, audits] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        isActive: true,
        role: { select: { slug: true, name: true } },
      },
    }),
    prisma.inventoryItem.findMany(),
    prisma.inventoryTransaction.findMany({ take: 500, orderBy: { createdAt: "desc" } }),
    prisma.auditLog.findMany({ take: 500, orderBy: { createdAt: "desc" } }),
  ]);

  const payload = {
    generatedAt: new Date().toISOString(),
    users,
    inventory_items: items,
    inventory_transactions: txs,
    audit_logs: audits,
  };

  return NextResponse.json(payload, {
    headers: {
      "content-disposition": `attachment; filename="mbg-backup-${Date.now()}.json"`,
    },
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(user.roleSlug, "backup:run")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ua = req.headers.get("user-agent");

  const snapshot = await prisma.inventoryItem.count();

  const job = await prisma.backupJob.create({
    data: {
      filename: `manual-${Date.now()}.json`,
      sizeBytes: snapshot,
      createdById: user.id,
    },
  });

  await writeAuditLog({
    userId: user.id,
    role: user.roleSlug,
    action: "BACKUP_MANUAL",
    entity: "BackupJob",
    entityId: job.id,
    ip,
    userAgent: ua,
  });

  return NextResponse.json({ ok: true, id: job.id });
}
