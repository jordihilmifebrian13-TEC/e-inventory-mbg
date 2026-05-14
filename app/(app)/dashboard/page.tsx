import { auth } from "@/auth";
import { DashboardPageClient } from "@/features/dashboard/dashboard-page-client";

export default async function DashboardPage() {
  const session = await auth();
  return <DashboardPageClient role={session!.user.roleSlug} />;
}
