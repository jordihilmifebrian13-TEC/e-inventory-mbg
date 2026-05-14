import { RoleSlug } from "@prisma/client";

export const APP_NAME = "E-Inventory System MBG";
export const APP_SHORT = "E-Inventory MBG";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
export const MAX_LOGIN_ATTEMPTS = 3;
export const LOCKOUT_MINUTES = 30;

export const VAT_RATE = 0.11;

export const FRESHNESS_SEGAR_HOURS = 12;
export const FRESHNESS_WARNING_HOURS = 24;

export const RETURN_MAX_HOURS = 24;

export const HOTLINE_NUMBER = "127";
export const HOTLINE_LABEL = "Hotline Darurat MBG";

export const ROUTE_ROLE_MATRIX: Record<string, RoleSlug[]> = {
  "/dashboard": [
    RoleSlug.SUPER_ADMIN,
    RoleSlug.KOORDINATOR_SPPG,
    RoleSlug.PETUGAS_GUDANG,
    RoleSlug.PETUGAS_GIZI,
    RoleSlug.STOK_AUDITOR,
  ],
  "/inventory": [
    RoleSlug.SUPER_ADMIN,
    RoleSlug.KOORDINATOR_SPPG,
    RoleSlug.PETUGAS_GUDANG,
    RoleSlug.PETUGAS_GIZI,
    RoleSlug.STOK_AUDITOR,
  ],
  "/transactions": [
    RoleSlug.SUPER_ADMIN,
    RoleSlug.KOORDINATOR_SPPG,
    RoleSlug.PETUGAS_GUDANG,
  ],
  "/verification": [RoleSlug.SUPER_ADMIN, RoleSlug.KOORDINATOR_SPPG],
  "/reports": [
    RoleSlug.SUPER_ADMIN,
    RoleSlug.KOORDINATOR_SPPG,
    RoleSlug.PETUGAS_GIZI,
    RoleSlug.STOK_AUDITOR,
  ],
  "/audit": [RoleSlug.SUPER_ADMIN, RoleSlug.STOK_AUDITOR],
  "/users": [RoleSlug.SUPER_ADMIN],
  "/settings": [RoleSlug.SUPER_ADMIN],
  "/backup": [RoleSlug.SUPER_ADMIN],
  "/hotline": [
    RoleSlug.SUPER_ADMIN,
    RoleSlug.KOORDINATOR_SPPG,
    RoleSlug.PETUGAS_GUDANG,
    RoleSlug.PETUGAS_GIZI,
    RoleSlug.STOK_AUDITOR,
  ],
};
