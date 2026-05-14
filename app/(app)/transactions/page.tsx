import prisma from "@/lib/prisma";
import { TransactionsWorkspace } from "@/features/transactions/transactions-workspace";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, unit: true },
  });

  return <TransactionsWorkspace items={items} />;
}
