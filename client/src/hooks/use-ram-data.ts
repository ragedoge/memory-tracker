import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Price, Product } from "@shared/schema";

export function usePrices(category: string, type: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const qs = params.toString();
  const url = `/api/${category}/prices/${type}${qs ? `?${qs}` : ""}`;

  return useQuery<Price[]>({
    queryKey: ["/api/prices", category, type, startDate, endDate],
    queryFn: async () => {
      const res = await apiRequest("GET", url);
      return res.json();
    },
  });
}

export function useExchangeRates() {
  return useQuery<Record<string, number>>({
    queryKey: ["/api/exchange-rates"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/exchange-rates");
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useProducts(category: string, type: string, capacityGb?: number) {
  const params = new URLSearchParams();
  if (capacityGb) params.set("capacityGb", String(capacityGb));
  const qs = params.toString();
  const url = `/api/${category}/products/${type}${qs ? `?${qs}` : ""}`;

  return useQuery<Product[]>({
    queryKey: ["/api/products", category, type, capacityGb],
    queryFn: async () => {
      const res = await apiRequest("GET", url);
      return res.json();
    },
  });
}
