import { auth } from "@/auth";
import { InventoryTable } from "@/features/inventory/inventory-table";

export default async function InventoryPage() {
  const session = await auth();
  return <InventoryTable role={session!.user.roleSlug} />;
}
