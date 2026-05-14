import { RoleSlug } from "@prisma/client";
import {
  Boxes,
  ClipboardCheck,
  FileBarChart,
  LayoutDashboard,
  Phone,
  Shield,
  Truck,
  Users,
  Database,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: RoleSlug[];
};

export const mainNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      RoleSlug.SUPER_ADMIN,
      RoleSlug.KOORDINATOR_SPPG,
      RoleSlug.PETUGAS_GUDANG,
      RoleSlug.PETUGAS_GIZI,
      RoleSlug.STOK_AUDITOR,
    ],
  },
  {
    title: "Hotline 127",
    href: "/hotline",
    icon: Phone,
    roles: [
      RoleSlug.SUPER_ADMIN,
      RoleSlug.KOORDINATOR_SPPG,
      RoleSlug.PETUGAS_GUDANG,
      RoleSlug.PETUGAS_GIZI,
      RoleSlug.STOK_AUDITOR,
    ],
  },
  {
    title: "Status Stok",
    href: "/inventory",
    icon: Boxes,
    roles: [
      RoleSlug.SUPER_ADMIN,
      RoleSlug.KOORDINATOR_SPPG,
      RoleSlug.PETUGAS_GUDANG,
      RoleSlug.PETUGAS_GIZI,
      RoleSlug.STOK_AUDITOR,
    ],
  },
  {
    title: "Transaksi",
    href: "/transactions",
    icon: Truck,
    roles: [
      RoleSlug.SUPER_ADMIN,
      RoleSlug.KOORDINATOR_SPPG,
      RoleSlug.PETUGAS_GUDANG,
    ],
  },
  {
    title: "Verifikasi",
    href: "/verification",
    icon: ClipboardCheck,
    roles: [RoleSlug.SUPER_ADMIN, RoleSlug.KOORDINATOR_SPPG],
  },
  {
    title: "Laporan",
    href: "/reports",
    icon: FileBarChart,
    roles: [
      RoleSlug.SUPER_ADMIN,
      RoleSlug.KOORDINATOR_SPPG,
      RoleSlug.PETUGAS_GIZI,
      RoleSlug.STOK_AUDITOR,
    ],
  },
  {
    title: "Audit Trail",
    href: "/audit",
    icon: Shield,
    roles: [RoleSlug.SUPER_ADMIN, RoleSlug.STOK_AUDITOR],
  },
  {
    title: "Pengguna",
    href: "/users",
    icon: Users,
    roles: [RoleSlug.SUPER_ADMIN],
  },
  {
    title: "Backup",
    href: "/backup",
    icon: Database,
    roles: [RoleSlug.SUPER_ADMIN],
  },
  {
    title: "Pengaturan",
    href: "/settings",
    icon: Settings,
    roles: [RoleSlug.SUPER_ADMIN],
  },
];
