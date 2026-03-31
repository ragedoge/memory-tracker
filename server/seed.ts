import { storage } from "./storage";
import { db } from "./db";
import { prices, products } from "@shared/schema";

function generateDailyPrices(
  startDate: Date,
  endDate: Date,
  monthlyAnchors: { month: string; price: number }[],
  volatility: number = 0.02
): { date: string; price: number }[] {
  const result: { date: string; price: number }[] = [];
  const anchorMap = new Map(monthlyAnchors.map(a => [a.month, a.price]));
  let currentDate = new Date(startDate);
  let lastPrice = monthlyAnchors[0].price;

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const monthStr = dateStr.substring(0, 7);
    let targetPrice = lastPrice;

    if (anchorMap.has(monthStr)) {
      targetPrice = anchorMap.get(monthStr)!;
    } else {
      const sorted = monthlyAnchors.sort((a, b) => a.month.localeCompare(b.month));
      let prev = sorted[0], next = sorted[sorted.length - 1];
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].month <= monthStr && sorted[i + 1].month > monthStr) {
          prev = sorted[i]; next = sorted[i + 1]; break;
        }
      }
      const prevD = new Date(prev.month + '-01').getTime();
      const nextD = new Date(next.month + '-01').getTime();
      const curD = currentDate.getTime();
      const ratio = Math.max(0, Math.min(1, (curD - prevD) / (nextD - prevD)));
      targetPrice = prev.price + (next.price - prev.price) * ratio;
    }

    const noise = (Math.random() - 0.5) * 2 * volatility * targetPrice;
    const dow = currentDate.getDay();
    lastPrice = dow === 0 || dow === 6
      ? lastPrice + (targetPrice - lastPrice) * 0.01
      : targetPrice + noise;
    lastPrice = Math.max(0.01, lastPrice);
    result.push({ date: dateStr, price: Math.round(lastPrice * 1000) / 1000 });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return result;
}

export function seedDatabase() {
  const existing = db.select().from(prices).all();
  if (existing.length > 0) return;
  console.log("Seeding database...");

  // ==================== RAM DATA ====================

  const ddr3Anchors = [
    { month: "2014-01", price: 7.50 }, { month: "2014-06", price: 7.20 }, { month: "2014-12", price: 6.80 },
    { month: "2015-06", price: 5.50 }, { month: "2015-12", price: 4.20 },
    { month: "2016-03", price: 3.50 }, { month: "2016-06", price: 2.80 }, { month: "2016-09", price: 3.10 }, { month: "2016-12", price: 4.50 },
    { month: "2017-03", price: 5.80 }, { month: "2017-06", price: 6.50 }, { month: "2017-09", price: 7.20 }, { month: "2017-12", price: 8.10 },
    { month: "2018-03", price: 8.50 }, { month: "2018-06", price: 7.80 }, { month: "2018-09", price: 6.50 }, { month: "2018-12", price: 5.20 },
    { month: "2019-03", price: 4.00 }, { month: "2019-06", price: 3.20 }, { month: "2019-09", price: 2.80 }, { month: "2019-12", price: 2.60 },
    { month: "2020-03", price: 3.00 }, { month: "2020-06", price: 3.40 }, { month: "2020-09", price: 3.80 }, { month: "2020-12", price: 3.50 },
    { month: "2021-03", price: 4.00 }, { month: "2021-06", price: 3.80 }, { month: "2021-09", price: 3.50 }, { month: "2021-12", price: 3.20 },
    { month: "2022-06", price: 2.80 }, { month: "2022-12", price: 2.50 },
    { month: "2023-06", price: 2.40 }, { month: "2023-12", price: 3.00 },
    { month: "2024-06", price: 3.50 }, { month: "2024-12", price: 5.00 },
    { month: "2025-03", price: 4.80 }, { month: "2025-06", price: 6.20 }, { month: "2025-09", price: 7.50 }, { month: "2025-12", price: 9.50 },
    { month: "2026-03", price: 10.50 },
  ];

  const ddr4Anchors = [
    { month: "2016-01", price: 5.00 }, { month: "2016-06", price: 3.80 }, { month: "2016-09", price: 4.50 }, { month: "2016-12", price: 5.80 },
    { month: "2017-03", price: 6.50 }, { month: "2017-06", price: 7.00 }, { month: "2017-09", price: 7.80 }, { month: "2017-12", price: 8.80 },
    { month: "2018-03", price: 9.00 }, { month: "2018-06", price: 8.20 }, { month: "2018-09", price: 7.00 }, { month: "2018-12", price: 5.50 },
    { month: "2019-03", price: 4.20 }, { month: "2019-06", price: 3.40 }, { month: "2019-09", price: 2.90 }, { month: "2019-12", price: 2.70 },
    { month: "2020-03", price: 3.00 }, { month: "2020-06", price: 3.50 }, { month: "2020-09", price: 3.80 }, { month: "2020-12", price: 3.50 },
    { month: "2021-03", price: 4.20 }, { month: "2021-06", price: 4.50 }, { month: "2021-09", price: 3.80 }, { month: "2021-12", price: 3.30 },
    { month: "2022-03", price: 3.00 }, { month: "2022-06", price: 2.50 }, { month: "2022-09", price: 2.00 }, { month: "2022-12", price: 1.80 },
    { month: "2023-03", price: 1.60 }, { month: "2023-06", price: 1.50 }, { month: "2023-09", price: 1.70 }, { month: "2023-12", price: 2.00 },
    { month: "2024-03", price: 2.20 }, { month: "2024-06", price: 2.50 }, { month: "2024-09", price: 2.30 }, { month: "2024-12", price: 1.90 },
    { month: "2025-01", price: 1.88 }, { month: "2025-03", price: 1.56 }, { month: "2025-05", price: 2.50 }, { month: "2025-06", price: 3.75 },
    { month: "2025-08", price: 5.31 }, { month: "2025-09", price: 5.94 }, { month: "2025-10", price: 6.56 }, { month: "2025-12", price: 9.40 },
    { month: "2026-01", price: 10.20 }, { month: "2026-03", price: 11.80 },
  ];

  const ddr5Anchors = [
    { month: "2022-01", price: 12.00 }, { month: "2022-03", price: 10.50 }, { month: "2022-06", price: 8.50 },
    { month: "2022-09", price: 6.80 }, { month: "2022-12", price: 5.50 },
    { month: "2023-03", price: 4.80 }, { month: "2023-06", price: 4.20 }, { month: "2023-09", price: 3.80 }, { month: "2023-12", price: 3.50 },
    { month: "2024-03", price: 3.30 }, { month: "2024-06", price: 3.10 }, { month: "2024-09", price: 3.00 }, { month: "2024-12", price: 3.20 },
    { month: "2025-01", price: 3.75 }, { month: "2025-03", price: 3.59 }, { month: "2025-05", price: 4.06 }, { month: "2025-06", price: 4.06 },
    { month: "2025-08", price: 4.22 }, { month: "2025-09", price: 6.25 }, { month: "2025-10", price: 9.38 },
    { month: "2025-11", price: 12.50 }, { month: "2025-12", price: 14.00 },
    { month: "2026-01", price: 15.63 }, { month: "2026-02", price: 16.50 }, { month: "2026-03", price: 15.80 },
  ];

  // ==================== SSD DATA (per GB in USD) ====================

  const sataAnchors = [
    { month: "2018-01", price: 0.28 }, { month: "2018-06", price: 0.24 }, { month: "2018-12", price: 0.18 },
    { month: "2019-06", price: 0.12 }, { month: "2019-12", price: 0.10 },
    { month: "2020-03", price: 0.11 }, { month: "2020-06", price: 0.10 }, { month: "2020-09", price: 0.10 }, { month: "2020-12", price: 0.09 },
    { month: "2021-03", price: 0.095 }, { month: "2021-06", price: 0.10 }, { month: "2021-09", price: 0.09 }, { month: "2021-12", price: 0.085 },
    { month: "2022-03", price: 0.08 }, { month: "2022-06", price: 0.07 }, { month: "2022-09", price: 0.065 }, { month: "2022-12", price: 0.06 },
    { month: "2023-03", price: 0.05 }, { month: "2023-06", price: 0.045 }, { month: "2023-09", price: 0.042 }, { month: "2023-12", price: 0.04 },
    { month: "2024-03", price: 0.042 }, { month: "2024-06", price: 0.045 }, { month: "2024-09", price: 0.048 }, { month: "2024-12", price: 0.05 },
    { month: "2025-03", price: 0.055 }, { month: "2025-06", price: 0.065 }, { month: "2025-09", price: 0.085 }, { month: "2025-12", price: 0.12 },
    { month: "2026-01", price: 0.14 }, { month: "2026-02", price: 0.155 }, { month: "2026-03", price: 0.16 },
  ];

  const nvmeAnchors = [
    { month: "2018-01", price: 0.40 }, { month: "2018-06", price: 0.35 }, { month: "2018-12", price: 0.25 },
    { month: "2019-06", price: 0.15 }, { month: "2019-12", price: 0.12 },
    { month: "2020-03", price: 0.13 }, { month: "2020-06", price: 0.12 }, { month: "2020-09", price: 0.11 }, { month: "2020-12", price: 0.10 },
    { month: "2021-03", price: 0.11 }, { month: "2021-06", price: 0.10 }, { month: "2021-09", price: 0.095 }, { month: "2021-12", price: 0.09 },
    { month: "2022-03", price: 0.085 }, { month: "2022-06", price: 0.075 }, { month: "2022-09", price: 0.065 }, { month: "2022-12", price: 0.06 },
    { month: "2023-03", price: 0.05 }, { month: "2023-06", price: 0.04 }, { month: "2023-09", price: 0.038 }, { month: "2023-12", price: 0.035 },
    { month: "2024-03", price: 0.04 }, { month: "2024-06", price: 0.045 }, { month: "2024-09", price: 0.05 }, { month: "2024-12", price: 0.055 },
    { month: "2025-03", price: 0.065 }, { month: "2025-06", price: 0.08 }, { month: "2025-09", price: 0.11 }, { month: "2025-12", price: 0.16 },
    { month: "2026-01", price: 0.19 }, { month: "2026-02", price: 0.21 }, { month: "2026-03", price: 0.22 },
  ];

  // Generate daily data
  const allPrices = [
    ...generateDailyPrices(new Date("2014-01-01"), new Date("2026-03-31"), ddr3Anchors, 0.015)
      .map(p => ({ date: p.date, category: "RAM", type: "DDR3", priceUsd: p.price })),
    ...generateDailyPrices(new Date("2016-01-01"), new Date("2026-03-31"), ddr4Anchors, 0.018)
      .map(p => ({ date: p.date, category: "RAM", type: "DDR4", priceUsd: p.price })),
    ...generateDailyPrices(new Date("2022-01-01"), new Date("2026-03-31"), ddr5Anchors, 0.02)
      .map(p => ({ date: p.date, category: "RAM", type: "DDR5", priceUsd: p.price })),
    ...generateDailyPrices(new Date("2018-01-01"), new Date("2026-03-31"), sataAnchors, 0.015)
      .map(p => ({ date: p.date, category: "SSD", type: "SATA", priceUsd: p.price })),
    ...generateDailyPrices(new Date("2018-01-01"), new Date("2026-03-31"), nvmeAnchors, 0.02)
      .map(p => ({ date: p.date, category: "SSD", type: "NVMe", priceUsd: p.price })),
  ];

  storage.bulkInsertPrices(allPrices);
  console.log(`Seeded ${allPrices.length} price records`);

  // ==================== PRODUCT LINKS ====================
  const productData = [
    // --- RAM DDR4 ---
    { category: "RAM", type: "DDR4", capacityGb: 16, name: "Corsair Vengeance LPX 16GB (2x8GB) DDR4-3200", priceUsd: 180, url: "https://www.amazon.com/dp/B015FYATH0", retailer: "Amazon" },
    { category: "RAM", type: "DDR4", capacityGb: 16, name: "G.Skill Ripjaws V 16GB (2x8GB) DDR4-3200", priceUsd: 170, url: "https://www.newegg.com/g-skill-16gb-288-pin-ddr4-sdram/p/N82E16820232181", retailer: "Newegg" },
    { category: "RAM", type: "DDR4", capacityGb: 32, name: "Corsair Vengeance LPX 32GB (2x16GB) DDR4-3200", priceUsd: 350, url: "https://www.amazon.com/dp/B07RW6Z692", retailer: "Amazon" },
    { category: "RAM", type: "DDR4", capacityGb: 32, name: "Kingston FURY Beast 32GB (2x16GB) DDR4-3200", priceUsd: 320, url: "https://www.amazon.com/dp/B097K3RH7G", retailer: "Amazon" },
    { category: "RAM", type: "DDR4", capacityGb: 64, name: "Corsair Vengeance LPX 64GB (2x32GB) DDR4-3200", priceUsd: 680, url: "https://www.amazon.com/dp/B08GSGD4HY", retailer: "Amazon" },

    // --- RAM DDR5 ---
    { category: "RAM", type: "DDR5", capacityGb: 16, name: "Corsair Vengeance DDR5-5200 16GB (2x8GB)", priceUsd: 259, url: "https://www.amazon.com/dp/B0B2NKKGN6", retailer: "Amazon" },
    { category: "RAM", type: "DDR5", capacityGb: 24, name: "G.Skill Trident Z5 Neo 24GB (2x12GB) DDR5-6000", priceUsd: 310, url: "https://www.newegg.com/g-skill-24gb/p/N82E16820374502", retailer: "Newegg" },
    { category: "RAM", type: "DDR5", capacityGb: 32, name: "Corsair Vengeance RGB DDR5-6000 32GB (2x16GB)", priceUsd: 369, url: "https://www.amazon.com/dp/B0CG9XVT3L", retailer: "Amazon" },
    { category: "RAM", type: "DDR5", capacityGb: 32, name: "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000", priceUsd: 399, url: "https://www.newegg.com/g-skill-32gb/p/N82E16820374360", retailer: "Newegg" },
    { category: "RAM", type: "DDR5", capacityGb: 48, name: "Corsair Vengeance RGB DDR5-6000 48GB (2x24GB)", priceUsd: 414, url: "https://www.amazon.com/dp/B0D4WQ4W2R", retailer: "Amazon" },
    { category: "RAM", type: "DDR5", capacityGb: 64, name: "Patriot Viper Venom DDR5-6000 64GB (2x32GB)", priceUsd: 749, url: "https://www.amazon.com/dp/B0CMHQHSC8", retailer: "Amazon" },
    { category: "RAM", type: "DDR5", capacityGb: 64, name: "Crucial Pro OC DDR5-6000 64GB (2x32GB)", priceUsd: 629, url: "https://www.amazon.com/dp/B0CX4WLWKP", retailer: "Amazon" },
    { category: "RAM", type: "DDR5", capacityGb: 96, name: "Crucial Pro DDR5-5600 96GB (2x48GB)", priceUsd: 809, url: "https://www.amazon.com/dp/B0D83RNYGT", retailer: "Amazon" },

    // --- RAM DDR3 ---
    { category: "RAM", type: "DDR3", capacityGb: 16, name: "Corsair Vengeance Pro 16GB (2x8GB) DDR3-1866", priceUsd: 120, url: "https://www.amazon.com/dp/B00D6E8QVK", retailer: "Amazon" },
    { category: "RAM", type: "DDR3", capacityGb: 32, name: "Crucial 32GB Kit (4x8GB) DDR3-1600", priceUsd: 210, url: "https://www.amazon.com/dp/B008LTJJM2", retailer: "Amazon" },

    // --- SSD SATA ---
    { category: "SSD", type: "SATA", capacityGb: 512, name: "Samsung 870 EVO 500GB SATA SSD", priceUsd: 85, url: "https://www.amazon.com/dp/B08QBJ2YMG", retailer: "Amazon" },
    { category: "SSD", type: "SATA", capacityGb: 1024, name: "Samsung 870 EVO 1TB SATA SSD", priceUsd: 160, url: "https://www.amazon.com/dp/B08QBJ2YMG", retailer: "Amazon" },
    { category: "SSD", type: "SATA", capacityGb: 1024, name: "Crucial MX500 1TB SATA SSD", priceUsd: 140, url: "https://www.amazon.com/dp/B078211KBB", retailer: "Amazon" },
    { category: "SSD", type: "SATA", capacityGb: 2048, name: "Samsung 870 EVO 2TB SATA SSD", priceUsd: 310, url: "https://www.amazon.com/dp/B08QB93S6R", retailer: "Amazon" },
    { category: "SSD", type: "SATA", capacityGb: 4096, name: "Samsung 870 EVO 4TB SATA SSD", priceUsd: 620, url: "https://www.amazon.com/dp/B08QBL36GF", retailer: "Amazon" },

    // --- SSD NVMe ---
    { category: "SSD", type: "NVMe", capacityGb: 512, name: "Samsung 990 EVO 500GB NVMe M.2", priceUsd: 90, url: "https://www.amazon.com/dp/B0CXKGCJQZ", retailer: "Amazon" },
    { category: "SSD", type: "NVMe", capacityGb: 1024, name: "Samsung 990 Pro 1TB NVMe M.2", priceUsd: 220, url: "https://www.amazon.com/dp/B0BHJJ9Y77", retailer: "Amazon" },
    { category: "SSD", type: "NVMe", capacityGb: 1024, name: "WD Black SN850X 1TB NVMe M.2", priceUsd: 200, url: "https://www.amazon.com/dp/B0B7CKVCCV", retailer: "Amazon" },
    { category: "SSD", type: "NVMe", capacityGb: 2048, name: "Samsung 990 Pro 2TB NVMe M.2", priceUsd: 420, url: "https://www.amazon.com/dp/B0BHJF2VRN", retailer: "Amazon" },
    { category: "SSD", type: "NVMe", capacityGb: 2048, name: "WD Black SN850X 2TB NVMe M.2", priceUsd: 380, url: "https://www.amazon.com/dp/B0B7CMZ3QH", retailer: "Amazon" },
    { category: "SSD", type: "NVMe", capacityGb: 4096, name: "Samsung 990 Pro 4TB NVMe M.2", priceUsd: 800, url: "https://www.amazon.com/dp/B0CRK36J4L", retailer: "Amazon" },
    { category: "SSD", type: "NVMe", capacityGb: 4096, name: "Crucial T700 4TB NVMe M.2 Gen5", priceUsd: 850, url: "https://www.amazon.com/dp/B0C4HSGLPH", retailer: "Amazon" },
  ];

  storage.bulkInsertProducts(productData);
  console.log(`Seeded ${productData.length} product records`);
}
