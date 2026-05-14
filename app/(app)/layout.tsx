import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.roleSlug;

  return (
    <DashboardShell role={role} userName={session.user.name ?? ""}>
      {children}
    </DashboardShell>
  );
}
