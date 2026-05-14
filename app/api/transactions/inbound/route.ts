import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/api-user";
import { hasPermission } from "@/lib/rbac";
import { createInbound } from "@/services/inventory.service";

const bodySchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().positive(),
  supplier: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  performedAt: z.string().datetime(),
  invoiceUrl: z.string().url().optional().nullable(),
});

export async function POST(req: Request) {
  const auth = await requireSessionUser();
  if ("error" in auth) return auth.error;
  if (!hasPermission(auth.user.roleSlug, "transactions:create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = req.headers.get("user-agent");

  try {
    const tx = await createInbound({
      ...parsed.data,
      performedAt: new Date(parsed.data.performedAt),
      userId: auth.user.id,
      roleSlug: auth.user.roleSlug,
      ip,
      userAgent,
    });
    return NextResponse.json({ ok: true, id: tx.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menyimpan";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
