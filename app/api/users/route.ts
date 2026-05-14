import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-user";
import { hasPermission } from "@/lib/rbac";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(user.roleSlug, "users:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { role: true },
  });

  return NextResponse.json({
    users: rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username,
      role: u.role.slug,
      isActive: u.isActive,
      failedLoginAttempts: u.failedLoginAttempts,
      lockedUntil: u.lockedUntil,
    })),
  });
}
