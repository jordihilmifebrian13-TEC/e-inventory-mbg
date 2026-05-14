import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { RoleSlug } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  roleSlug: RoleSlug;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
    roleSlug: session.user.roleSlug,
  };
}

export async function requireSessionUser() {
  const s = await getSessionUser();
  if (!s) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: s.id },
    include: { role: true },
  });
  if (!dbUser?.isActive) {
    return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user: { ...s, db: dbUser } };
}
