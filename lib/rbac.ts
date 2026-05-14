import { RoleSlug } from "@prisma/client";
import { ROUTE_ROLE_MATRIX } from "@/lib/constants";

export type PermissionKey =
  | "users:manage"
  | "roles:manage"
  | "system:config"
  | "backup:run"
  | "inventory:read"
  | "inventory:write"
  | "transactions:create"
  | "transactions:verify"
  | "reports:read"
  | "reports:export"
  | "audit:read"
  | "audit:export";

const ROLE_PERMISSIONS: Record<RoleSlug, PermissionKey[]> = {
  SUPER_ADMIN: [
    "users:manage",
    "roles:manage",
    "system:config",
    "backup:run",
    "inventory:read",
    "inventory:write",
    "transactions:create",
    "transactions:verify",
    "reports:read",
    "reports:export",
    "audit:read",
    "audit:export",
  ],
  KOORDINATOR_SPPG: [
    "inventory:read",
    "transactions:verify",
    "reports:read",
    "reports:export",
  ],
  PETUGAS_GUDANG: [
    "inventory:read",
    "inventory:write",
    "transactions:create",
    "reports:read",
  ],
  PETUGAS_GIZI: ["inventory:read", "reports:read"],
  STOK_AUDITOR: [
    "inventory:read",
    "audit:read",
    "audit:export",
    "reports:read",
  ],
};

export function hasPermission(role: RoleSlug, key: PermissionKey) {
  return ROLE_PERMISSIONS[role]?.includes(key) ?? false;
}

export function canAccessRoute(role: RoleSlug, pathname: string) {
  const base = pathname.split("?")[0] ?? pathname;
  for (const [prefix, roles] of Object.entries(ROUTE_ROLE_MATRIX)) {
    if (base === prefix || base.startsWith(`${prefix}/`)) {
      return roles.includes(role);
    }
  }
  return true;
}
