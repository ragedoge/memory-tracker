import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Per-GB price history for both RAM and SSD
export const prices = sqliteTable("prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // YYYY-MM-DD
  category: text("category").notNull(), // "RAM" or "SSD"
  type: text("type").notNull(), // DDR3, DDR4, DDR5, SATA, NVMe
  priceUsd: real("price_usd").notNull(), // price per GB in USD
});

// Representative products with purchase links
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(), // "RAM" or "SSD"
  type: text("type").notNull(), // DDR4, DDR5, SATA, NVMe
  capacityGb: integer("capacity_gb").notNull(), // 16, 32, 64, 512, 1024, 2048
  name: text("name").notNull(),
  priceUsd: real("price_usd").notNull(), // current approximate price
  url: text("url").notNull(),
  retailer: text("retailer").notNull(), // Amazon, Newegg, etc.
});

export const insertPriceSchema = createInsertSchema(prices).omit({ id: true });
export type InsertPrice = z.infer<typeof insertPriceSchema>;
export type Price = typeof prices.$inferSelect;

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
