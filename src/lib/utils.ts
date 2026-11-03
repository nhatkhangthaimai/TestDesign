import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number | string | null | undefined): string {
  if (amount == null) return "0 ₫";
  const num = typeof amount === "number" ? amount : parseFloat(String(amount));
  if (isNaN(num)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function calculateDiscount(
  regular: number | string,
  sale?: number | string | null
): number {
  const regNum = typeof regular === "number" ? regular : parseFloat(String(regular));
  const saleNum =
    sale != null ? (typeof sale === "number" ? sale : parseFloat(String(sale))) : null;
  if (!saleNum || isNaN(regNum) || isNaN(saleNum) || saleNum >= regNum || regNum <= 0) {
    return 0;
  }
  return Math.round(((regNum - saleNum) / regNum) * 100);
}
