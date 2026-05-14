import prisma from "@/lib/prisma";

export async function writeAuditLog(input: {
  userId?: string | null;
  role?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  before?: unknown;
  after?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? undefined,
      role: input.role ?? undefined,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? undefined,
      ip: input.ip ?? undefined,
      userAgent: input.userAgent ?? undefined,
      before: input.before === undefined ? undefined : (input.before as object),
      after: input.after === undefined ? undefined : (input.after as object),
    },
  });
}
