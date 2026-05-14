"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { useIdleSignOut } from "@/hooks/use-idle-signout";
import type { RoleSlug } from "@prisma/client";

const COLLAPSE_KEY = "mbg_sidebar_collapsed";

const TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Ringkasan operasional harian" },
  "/hotline": { title: "Hotline 127", subtitle: "Saluran darurat Program MBG" },
  "/inventory": { title: "Status Stok", subtitle: "FIFO & indikator stok" },
  "/transactions": { title: "Transaksi", subtitle: "Masuk, pakai, return, waste" },
  "/verification": { title: "Verifikasi", subtitle: "Approve / reject transaksi" },
  "/reports": { title: "Laporan", subtitle: "Ekspor & cetak" },
  "/audit": { title: "Audit Trail", subtitle: "Jejak aktivitas sistem" },
  "/users": { title: "Pengguna", subtitle: "Manajemen akun & peran" },
  "/backup": { title: "Backup & Restore", subtitle: "Cadangan data" },
  "/settings": { title: "Pengaturan", subtitle: "Konfigurasi sistem" },
};

export function DashboardShell({
  role,
  userName,
  children,
}: {
  role: RoleSlug;
  userName: string;
  children: React.ReactNode;
}) {
  useIdleSignOut();
  const pathname = usePathname();
  const meta = TITLES[pathname] ?? { title: "E-Inventory MBG" };

  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    try {
      const v = localStorage.getItem(COLLAPSE_KEY);
      if (v === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = React.useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const subtitle = meta.subtitle ?? (userName ? `Halo, ${userName}` : undefined);

  return (
    <div className="flex min-h-dvh w-full bg-muted/30">
      <AppSidebar role={role} collapsed={collapsed} onToggleCollapsed={toggle} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={meta.title} subtitle={subtitle} role={role} />
        <main className="flex-1 space-y-6 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
