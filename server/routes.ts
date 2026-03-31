import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";

export function registerRoutes(server: Server, app: Express) {
  // Get all types for a category
  app.get("/api/:category/types", (req, res) => {
    const cat = req.params.category.toUpperCase();
    if (cat !== "RAM" && cat !== "SSD") {
      return res.status(400).json({ error: "Invalid category. Use RAM or SSD" });
    }
    res.json(storage.getAllTypes(cat));
  });

  // Get prices by category and type
  app.get("/api/:category/prices/:type", (req, res) => {
    const cat = req.params.category.toUpperCase();
    const type = req.params.type; // keep original casing
    const { startDate, endDate } = req.query;

    if (cat !== "RAM" && cat !== "SSD") {
      return res.status(400).json({ error: "Invalid category" });
    }

    const p = storage.getPrices(
      cat, type,
      startDate as string | undefined,
      endDate as string | undefined
    );
    res.json(p);
  });

  // Get products for a category/type/capacity
  app.get("/api/:category/products/:type", (req, res) => {
    const cat = req.params.category.toUpperCase();
    const type = req.params.type; // keep original casing
    const capacityGb = req.query.capacityGb ? parseInt(req.query.capacityGb as string) : undefined;

    const prods = storage.getProducts(cat, type, capacityGb);
    res.json(prods);
  });

  // Exchange rates
  app.get("/api/exchange-rates", (_req, res) => {
    res.json({
      USD: 1,
      KRW: 1450,
      JPY: 150,
      EUR: 0.92,
      GBP: 0.79,
      CNY: 7.25,
    });
  });
}
