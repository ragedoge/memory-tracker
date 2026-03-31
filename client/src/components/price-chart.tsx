import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TYPE_COLORS } from "@/lib/constants";
import { format, parseISO } from "date-fns";

interface PriceChartProps {
  data: { date: string; price: number; priceUsd: number }[];
  typeKey: string;
  currency: string;
  currencySymbol: string;
  formatPrice: (value: number) => string;
}

export function PriceChart({
  data,
  typeKey,
  currency,
  currencySymbol,
  formatPrice,
}: PriceChartProps) {
  const isUp = data.length > 1 && data[data.length - 1].price >= data[0].price;
  const chartColor = isUp ? "#ef4444" : "#10b981";

  const avgPrice = useMemo(() => {
    if (data.length === 0) return 0;
    return data.reduce((sum, d) => sum + d.price, 0) / data.length;
  }, [data]);

  const chartData = useMemo(() => {
    if (data.length <= 365) return data;
    const step = Math.ceil(data.length / 365);
    return data.filter((_, i) => i % step === 0 || i === data.length - 1);
  }, [data]);

  const tickFormatter = useMemo(() => {
    if (data.length <= 14) return (date: string) => format(parseISO(date), "MM/dd");
    if (data.length <= 120) return (date: string) => format(parseISO(date), "MM/dd");
    if (data.length <= 730) return (date: string) => format(parseISO(date), "yyyy-MM");
    return (date: string) => format(parseISO(date), "yyyy-MM");
  }, [data.length]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-xs" data-testid="chart-tooltip">
        <div className="text-muted-foreground mb-1">
          {format(parseISO(label), "yyyy-MM-dd (EEE)")}
        </div>
        <div className="font-semibold text-sm tabular-nums">
          {formatPrice(payload[0].value)}
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground text-sm">
        No data available for this range
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]" data-testid="price-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${typeKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={0.15} />
              <stop offset="100%" stopColor={chartColor} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={tickFormatter}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            minTickGap={60}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(v) => {
              if (currency === "KRW") return `₩${Math.round(v).toLocaleString()}`;
              if (currency === "JPY") return `¥${Math.round(v).toLocaleString()}`;
              if (v >= 1000) return `${currencySymbol}${Math.round(v).toLocaleString()}`;
              if (v >= 100) return `${currencySymbol}${v.toFixed(0)}`;
              if (v >= 1) return `${currencySymbol}${v.toFixed(2)}`;
              return `${currencySymbol}${v.toFixed(3)}`;
            }}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={currency === "KRW" ? 100 : 70}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <ReferenceLine
            y={avgPrice}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="6 4"
            opacity={0.4}
            label={{ value: `AVG ${formatPrice(avgPrice)}`, position: "right", fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={chartColor}
            strokeWidth={1.5}
            fill={`url(#gradient-${typeKey})`}
            dot={false}
            activeDot={{ r: 4, fill: chartColor, stroke: "hsl(var(--background))", strokeWidth: 2 }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
