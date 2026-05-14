import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/api-user";
import { hasPermission } from "@/lib/rbac";
import { rejectTransaction } from "@/services/inventory.service";

const bodySchema = z.object({
  note: z.string().min(3),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireSessionUser();
  if ("error" in auth) return auth.error;
  if (!hasPermission(auth.user.roleSlug, "transactions:verify")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Catatan revisi wajib" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = req.headers.get("user-agent");

  try {
    await rejectTransaction({
      transactionId: id,
      userId: auth.user.id,
      roleSlug: auth.user.roleSlug,
      note: parsed.data.note,
      ip,
      userAgent,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal reject";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
