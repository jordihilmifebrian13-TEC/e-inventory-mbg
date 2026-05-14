import {
  FRESHNESS_SEGAR_HOURS,
  FRESHNESS_WARNING_HOURS,
} from "@/lib/constants";

export type FreshnessStatus = "SEGER" | "WARNING" | "EXPIRED";

export function freshnessFromReceivedAt(receivedAt: Date, now = new Date()) {
  const hours =
    (now.getTime() - receivedAt.getTime()) / (1000 * 60 * 60);
  if (hours < FRESHNESS_SEGAR_HOURS) return "SEGER" satisfies FreshnessStatus;
  if (hours < FRESHNESS_WARNING_HOURS)
    return "WARNING" satisfies FreshnessStatus;
  return "EXPIRED" satisfies FreshnessStatus;
}

export function freshnessLabel(status: FreshnessStatus) {
  switch (status) {
    case "SEGER":
      return "Segar";
    case "WARNING":
      return "Perhatian";
    case "EXPIRED":
      return "Kedaluwarsa";
  }
}
