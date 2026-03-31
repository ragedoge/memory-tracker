import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, BarChart3, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  high: number;
  low: number;
  latest: number;
  change: number;
  percentChange: number;
  formatPrice: (value: number) => string;
  isLoading: boolean;
  selectedRange: string;
  dataCount: number;
}

export function StatsCards({
  high,
  low,
  latest,
  change,
  percentChange,
  formatPrice,
  isLoading,
  selectedRange,
  dataCount,
}: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const isUp = change >= 0;

  const cards = [
    {
      label: "High",
      sublabel: selectedRange,
      value: formatPrice(high),
      icon: <ArrowUpRight className="w-4 h-4 text-red-500" />,
      accent: "text-red-500",
    },
    {
      label: "Low",
      sublabel: selectedRange,
      value: formatPrice(low),
      icon: <ArrowDownRight className="w-4 h-4 text-emerald-500" />,
      accent: "text-emerald-500",
    },
    {
      label: "Change",
      sublabel: selectedRange,
      value: `${isUp ? "+" : ""}${percentChange.toFixed(2)}%`,
      icon: isUp ? (
        <TrendingUp className="w-4 h-4 text-red-500" />
      ) : (
        <TrendingDown className="w-4 h-4 text-emerald-500" />
      ),
      accent: isUp ? "text-red-500" : "text-emerald-500",
    },
    {
      label: "Data Points",
      sublabel: selectedRange,
      value: dataCount.toLocaleString(),
      icon: <Activity className="w-4 h-4 text-muted-foreground" />,
      accent: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-testid="stats-grid">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-4 transition-colors hover:border-primary/20"
          data-testid={`stat-card-${i}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              {card.label}{" "}
              <span className="text-[10px] opacity-60">({card.sublabel})</span>
            </span>
            {card.icon}
          </div>
          <div className={`text-lg font-bold tabular-nums ${card.accent}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
