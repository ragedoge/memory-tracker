import { useState, useMemo } from "react";
import { usePrices, useExchangeRates, useProducts } from "@/hooks/use-ram-data";
import {
  CATEGORIES, TYPES_BY_CATEGORY, TIME_RANGES, CURRENCIES, TYPE_COLORS,
  CAPACITY_OPTIONS, formatCapacity,
  type Category, type PriceMode,
} from "@/lib/constants";
import { PriceChart } from "@/components/price-chart";
import { StatsCards } from "@/components/stats-cards";
import { ProductPanel } from "@/components/product-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, MemoryStick, HardDrive, Moon, Sun, Mail, Heart, Copy, Check, X } from "lucide-react";
import { SiInstagram, SiGithub } from "react-icons/si";
import { format, subDays } from "date-fns";

export default function Home() {
  const [category, setCategory] = useState<Category>("RAM");
  const [selectedType, setSelectedType] = useState("DDR5");
  const [selectedRange, setSelectedRange] = useState("1Y");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [priceMode, setPriceMode] = useState<PriceMode>("per_gb");
  const [selectedCapacity, setSelectedCapacity] = useState<number | null>(null);
  const [showProducts, setShowProducts] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : true
  );

  // Dark mode
  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };
  useMemo(() => { document.documentElement.classList.toggle("dark", isDark); }, []);

  // When category changes, reset type
  const types = TYPES_BY_CATEGORY[category];
  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setSelectedType(TYPES_BY_CATEGORY[cat][0]);
    setPriceMode("per_gb");
    setSelectedCapacity(null);
    setShowProducts(false);
  };

  // When type changes, reset capacity
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setSelectedCapacity(null);
    setShowProducts(false);
  };

  // Capacity options for current selection
  const capacityOpts = CAPACITY_OPTIONS[category]?.[selectedType] || [];

  // When switching to capacity mode, select first capacity
  const handlePriceModeChange = (mode: PriceMode) => {
    setPriceMode(mode);
    if (mode === "capacity" && !selectedCapacity && capacityOpts.length > 0) {
      setSelectedCapacity(capacityOpts[0]);
    }
  };

  // Date range
  const today = "2026-03-31";
  const rangeConfig = TIME_RANGES.find((r) => r.label === selectedRange);
  const startDate = rangeConfig && rangeConfig.days > 0
    ? format(subDays(new Date(today), rangeConfig.days), "yyyy-MM-dd")
    : undefined;

  const { data: prices, isLoading } = usePrices(category, selectedType, startDate, today);
  const { data: exchangeRates } = useExchangeRates();
  const { data: productList } = useProducts(
    category, selectedType,
    priceMode === "capacity" && selectedCapacity ? selectedCapacity : undefined
  );

  const currencyInfo = CURRENCIES[selectedCurrency];
  const rate = exchangeRates?.[selectedCurrency] || 1;

  // Convert prices
  const convertedPrices = useMemo(() => {
    if (!prices) return [];
    const multiplier = priceMode === "capacity" && selectedCapacity
      ? rate * selectedCapacity
      : rate;
    return prices.map((p) => ({
      ...p,
      price: Math.round(p.priceUsd * multiplier * 100) / 100,
    }));
  }, [prices, rate, priceMode, selectedCapacity]);

  // Stats
  const latestPrice = convertedPrices.length > 0 ? convertedPrices[convertedPrices.length - 1].price : 0;
  const firstPrice = convertedPrices.length > 0 ? convertedPrices[0].price : 0;
  const priceChange = latestPrice - firstPrice;
  const percentChange = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;
  const highPrice = convertedPrices.length > 0 ? Math.max(...convertedPrices.map((p) => p.price)) : 0;
  const lowPrice = convertedPrices.length > 0 ? Math.min(...convertedPrices.map((p) => p.price)) : 0;

  // Format price
  const formatPrice = (value: number) => {
    if (selectedCurrency === "KRW") return `₩${Math.round(value).toLocaleString()}`;
    if (selectedCurrency === "JPY") return `¥${Math.round(value).toLocaleString()}`;
    if (value >= 1000) return `${currencyInfo.symbol}${Math.round(value).toLocaleString()}`;
    if (value >= 100) return `${currencyInfo.symbol}${value.toFixed(0)}`;
    if (value >= 1) return `${currencyInfo.symbol}${value.toFixed(2)}`;
    return `${currencyInfo.symbol}${value.toFixed(3)}`;
  };

  const unitLabel = priceMode === "capacity" && selectedCapacity
    ? `/ ${formatCapacity(selectedCapacity)}`
    : "/GB";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-sm.png" alt="Memory Tracker" className="w-8 h-8 object-contain" />
            <span className="font-semibold text-sm tracking-tight" data-testid="logo-text">
              Memory Tracker
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="h-8 px-2 pr-7 text-xs bg-secondary border border-border rounded-md text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 6px center",
              }}
              data-testid="currency-selector"
            >
              {Object.entries(CURRENCIES).map(([code, info]) => (
                <option key={code} value={code}>{info.symbol} {code}</option>
              ))}
            </select>
            <button onClick={toggleDark}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary transition-colors"
              data-testid="theme-toggle" aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Category tabs (RAM / SSD) */}
        <div className="flex items-center gap-2 mb-4" data-testid="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg border transition-all ${
                category === cat
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
              data-testid={`cat-${cat}`}
            >
              {cat === "RAM" ? <span className="inline-flex items-center gap-1.5"><MemoryStick className="w-3.5 h-3.5" /> RAM</span>
                : <span className="inline-flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> SSD</span>}
            </button>
          ))}
        </div>

        {/* Type tabs + price mode + capacity selector */}
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <div className="flex flex-col gap-3">
            {/* Type tabs */}
            <div className="flex gap-1" data-testid="type-tabs">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    selectedType === type
                      ? "text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                  style={selectedType === type ? { backgroundColor: TYPE_COLORS[type] } : undefined}
                  data-testid={`tab-${type}`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Price mode + capacity */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-0.5 bg-secondary/50 p-0.5 rounded-lg" data-testid="price-mode">
                <button
                  onClick={() => handlePriceModeChange("per_gb")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    priceMode === "per_gb"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="mode-per-gb"
                >
                  Per GB
                </button>
                <button
                  onClick={() => handlePriceModeChange("capacity")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    priceMode === "capacity"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="mode-capacity"
                >
                  By Capacity
                </button>
              </div>

              {priceMode === "capacity" && (
                <div className="flex gap-1" data-testid="capacity-selector">
                  {capacityOpts.map((cap) => (
                    <button
                      key={cap}
                      onClick={() => { setSelectedCapacity(cap); setShowProducts(false); }}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                        selectedCapacity === cap
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                      }`}
                      data-testid={`cap-${cap}`}
                    >
                      {formatCapacity(cap)}
                    </button>
                  ))}
                </div>
              )}

              {/* Buy button */}
              {priceMode === "capacity" && selectedCapacity && (
                <button
                  onClick={() => setShowProducts(!showProducts)}
                  className={`px-3 py-1 text-xs font-medium rounded-md border transition-all ${
                    showProducts
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-primary/50 text-primary hover:bg-primary/10"
                  }`}
                  data-testid="toggle-products"
                >
                  {showProducts ? "Hide Products" : "🛒 Buy Now"}
                </button>
              )}
            </div>
          </div>

          {/* Time range selector */}
          <div className="flex gap-0.5 bg-secondary/50 p-0.5 rounded-lg" data-testid="range-tabs">
            {TIME_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() => setSelectedRange(range.label)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedRange === range.label
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`range-${range.label}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price headline */}
        <div className="mb-4">
          {isLoading ? (
            <Skeleton className="h-10 w-60" />
          ) : (
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold tracking-tight tabular-nums" data-testid="current-price">
                {formatPrice(latestPrice)}
              </span>
              <span className="text-xs text-muted-foreground">{unitLabel}</span>
              <span
                className={`inline-flex items-center gap-1 text-sm font-medium tabular-nums ${
                  isPositive ? "text-red-500" : "text-emerald-500"
                }`}
                data-testid="price-change"
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive ? "+" : ""}{formatPrice(Math.abs(priceChange))} ({isPositive ? "+" : ""}{percentChange.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Product panel */}
        {showProducts && priceMode === "capacity" && selectedCapacity && productList && productList.length > 0 && (
          <ProductPanel
            products={productList}
            currency={selectedCurrency}
            rate={rate}
            formatPrice={formatPrice}
          />
        )}

        {/* Chart */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-6" data-testid="chart-container">
          {isLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <PriceChart
              data={convertedPrices}
              typeKey={selectedType}
              currency={selectedCurrency}
              currencySymbol={currencyInfo.symbol}
              formatPrice={formatPrice}
            />
          )}
        </div>

        {/* Stats */}
        <StatsCards
          high={highPrice}
          low={lowPrice}
          latest={latestPrice}
          change={priceChange}
          percentChange={percentChange}
          formatPrice={formatPrice}
          isLoading={isLoading}
          selectedRange={selectedRange}
          dataCount={convertedPrices.length}
        />
      </main>

      <footer className="border-t border-border mt-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Left - Site info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <img src="/logo-sm.png" alt="Memory Tracker" className="w-6 h-6 object-contain" />
                <span className="font-semibold text-sm">Memory Tracker</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track RAM & SSD prices like stocks. Daily updated pricing data with historical trends, capacity-based views, and product recommendations.
              </p>
            </div>

            {/* Center - Profile */}
            <div className="space-y-3 md:text-center">
              <p className="text-sm font-medium">Jun Hyeong Park</p>
              <div className="flex items-center gap-3 md:justify-center">
                <a
                  href="https://www.instagram.com/areciv_archiv/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Instagram"
                  data-testid="social-instagram"
                >
                  <SiInstagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://github.com/ragedoge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
                  aria-label="GitHub"
                  data-testid="social-github"
                >
                  <SiGithub className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => { setShowEmailPopup(true); setEmailCopied(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Email"
                  data-testid="social-email"
                >
                  <Mail className="w-3.5 h-3.5" />
                </button>
                <a
                  href="https://ko-fi.com/junhyeongpark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-pink-500/10 text-muted-foreground hover:text-pink-500 transition-all"
                  aria-label="Support on Ko-fi"
                  data-testid="social-kofi"
                >
                  <Heart className="w-3.5 h-3.5" />
                </a>
              </div>
              <a
                href="https://ko-fi.com/junhyeongpark"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-pink-500/30 text-pink-500 hover:bg-pink-500/10 transition-all"
                data-testid="kofi-button"
              >
                <Heart className="w-3 h-3" /> Support this project
              </a>
            </div>

            {/* Right - Links */}
            <div className="space-y-2 md:text-right">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Legal</p>
              <div className="flex gap-4 md:justify-end">
                <span className="text-xs text-muted-foreground/60 cursor-default">Privacy Policy</span>
                <span className="text-xs text-muted-foreground/60 cursor-default">Terms of Service</span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[10px] text-muted-foreground">
                © 2026 Memory Tracker. All rights reserved.
              </p>
              <p className="text-[10px] text-muted-foreground text-center sm:text-right">
                Data sourced from TrendForce, DRAMeXchange, Tom's Hardware, PCPartPicker, and industry reports.
                Prices are approximate. Product links may be affiliate links.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Email popup */}
      {showEmailPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowEmailPopup(false)}
          data-testid="email-overlay"
        >
          <div
            className="bg-card border border-border rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
            data-testid="email-popup"
          >
            <button
              onClick={() => setShowEmailPopup(false)}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Contact Email</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary rounded-lg px-3 py-2">
                  <span className="text-sm font-mono" data-testid="email-address">cjun0416@gmail.com</span>
                </div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText("cjun0416@gmail.com");
                    setEmailCopied(true);
                    setTimeout(() => setEmailCopied(false), 2000);
                  }}
                  className={`h-9 px-3 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-all ${
                    emailCopied
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  data-testid="copy-email-btn"
                >
                  {emailCopied ? (
                    <><Check className="w-3.5 h-3.5" /> Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
