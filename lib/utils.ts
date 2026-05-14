import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyIdr(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export function formatDecimal(value: unknown, fractionDigits = 2) {
  const n = Number(value);
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(Number.isFinite(n) ? n : 0);
}
