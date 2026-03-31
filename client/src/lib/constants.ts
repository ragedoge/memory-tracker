export const CATEGORIES = ["RAM", "SSD"] as const;
export type Category = (typeof CATEGORIES)[number];

export const RAM_TYPES = ["DDR3", "DDR4", "DDR5"] as const;
export const SSD_TYPES = ["SATA", "NVMe"] as const;

export const TYPES_BY_CATEGORY: Record<Category, readonly string[]> = {
  RAM: RAM_TYPES,
  SSD: SSD_TYPES,
};

export const TIME_RANGES = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
  { label: "3Y", days: 1095 },
  { label: "ALL", days: 0 },
] as const;

export const CURRENCIES: Record<string, { symbol: string; name: string }> = {
  USD: { symbol: "$", name: "US Dollar" },
  KRW: { symbol: "₩", name: "Korean Won" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  CNY: { symbol: "¥", name: "Chinese Yuan" },
};

export const TYPE_COLORS: Record<string, string> = {
  DDR3: "#f59e0b",
  DDR4: "#3b82f6",
  DDR5: "#10b981",
  SATA: "#8b5cf6",
  NVMe: "#ec4899",
};

// Capacity options per category/type (in GB)
export const CAPACITY_OPTIONS: Record<string, Record<string, number[]>> = {
  RAM: {
    DDR3: [16, 32],
    DDR4: [16, 32, 64],
    DDR5: [16, 24, 32, 48, 64, 96],
  },
  SSD: {
    SATA: [512, 1024, 2048, 4096],
    NVMe: [512, 1024, 2048, 4096],
  },
};

export function formatCapacity(gb: number): string {
  if (gb >= 1024) return `${gb / 1024}TB`;
  return `${gb}GB`;
}

export const PRICE_MODE_OPTIONS = [
  { value: "per_gb", label: "/GB" },
  { value: "capacity", label: "Capacity" },
] as const;
export type PriceMode = "per_gb" | "capacity";
