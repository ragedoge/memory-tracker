import type { Product } from "@shared/schema";
import { ExternalLink, ShoppingCart } from "lucide-react";

interface ProductPanelProps {
  products: Product[];
  currency: string;
  rate: number;
  formatPrice: (value: number) => string;
}

export function ProductPanel({ products, currency, rate, formatPrice }: ProductPanelProps) {
  if (products.length === 0) return null;

  return (
    <div className="bg-card border border-primary/20 rounded-xl p-4 mb-6" data-testid="product-panel">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Representative Products</h3>
        <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
          Prices are approximate
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <a
            key={product.id}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all group"
            data-testid={`product-${product.id}`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-0.5">{product.retailer}</div>
              <div className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </div>
              <div className="mt-1.5 text-base font-bold tabular-nums text-foreground">
                {formatPrice(product.priceUsd * rate)}
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
          </a>
        ))}
      </div>
    </div>
  );
}
