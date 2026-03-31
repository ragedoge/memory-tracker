import { prices, products, type Price, type InsertPrice, type Product, type InsertProduct } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, asc } from "drizzle-orm";

export interface IStorage {
  getPrices(category: string, type: string, startDate?: string, endDate?: string): Price[];
  getLatestPrice(category: string, type: string): Price | undefined;
  getAllTypes(category: string): string[];
  insertPrice(price: InsertPrice): Price;
  bulkInsertPrices(items: InsertPrice[]): void;
  getProducts(category: string, type: string, capacityGb?: number): Product[];
  bulkInsertProducts(items: InsertProduct[]): void;
}

export class DatabaseStorage implements IStorage {
  getPrices(category: string, type: string, startDate?: string, endDate?: string): Price[] {
    if (startDate && endDate) {
      return db.select().from(prices)
        .where(and(
          eq(prices.category, category),
          eq(prices.type, type),
          gte(prices.date, startDate),
          lte(prices.date, endDate)
        ))
        .orderBy(asc(prices.date))
        .all();
    }
    return db.select().from(prices)
      .where(and(eq(prices.category, category), eq(prices.type, type)))
      .orderBy(asc(prices.date))
      .all();
  }

  getLatestPrice(category: string, type: string): Price | undefined {
    return db.select().from(prices)
      .where(and(eq(prices.category, category), eq(prices.type, type)))
      .orderBy(asc(prices.date))
      .all()
      .pop();
  }

  getAllTypes(category: string): string[] {
    const results = db.select({ type: prices.type })
      .from(prices)
      .where(eq(prices.category, category))
      .groupBy(prices.type)
      .all();
    return results.map(r => r.type);
  }

  insertPrice(price: InsertPrice): Price {
    return db.insert(prices).values(price).returning().get();
  }

  bulkInsertPrices(items: InsertPrice[]): void {
    for (let i = 0; i < items.length; i += 100) {
      const batch = items.slice(i, i + 100);
      db.insert(prices).values(batch).run();
    }
  }

  getProducts(category: string, type: string, capacityGb?: number): Product[] {
    if (capacityGb) {
      return db.select().from(products)
        .where(and(
          eq(products.category, category),
          eq(products.type, type),
          eq(products.capacityGb, capacityGb)
        ))
        .all();
    }
    return db.select().from(products)
      .where(and(eq(products.category, category), eq(products.type, type)))
      .all();
  }

  bulkInsertProducts(items: InsertProduct[]): void {
    for (let i = 0; i < items.length; i += 100) {
      const batch = items.slice(i, i + 100);
      db.insert(products).values(batch).run();
    }
  }
}

export const storage = new DatabaseStorage();
