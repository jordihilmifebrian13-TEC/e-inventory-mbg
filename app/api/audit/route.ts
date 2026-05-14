import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-user";
import { hasPermission } from "@/lib/rbac";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(user.roleSlug, "audit:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take") ?? "50"), 200);

  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ logs: rows });
}
