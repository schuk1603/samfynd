import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Watchlist items
export const watchlistItems = sqliteTable("watchlist_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticker: text("ticker").notNull(),
  companyName: text("company_name").notNull(),
  sector: text("sector"),
  addedAt: text("added_at").notNull(),
  notes: text("notes"),
  targetPrice: real("target_price"),
  alertPrice: real("alert_price"),
});

export const insertWatchlistItemSchema = createInsertSchema(watchlistItems).omit({ id: true });
export type InsertWatchlistItem = z.infer<typeof insertWatchlistItemSchema>;
export type WatchlistItem = typeof watchlistItems.$inferSelect;

// Investment theses
export const theses = sqliteTable("theses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticker: text("ticker").notNull(),
  companyName: text("company_name").notNull(),
  direction: text("direction").notNull(), // "long" | "short"
  conviction: integer("conviction").notNull(), // 1-5
  thesis: text("thesis").notNull(),
  catalysts: text("catalysts").notNull(), // JSON array
  risks: text("risks").notNull(), // JSON array
  targetPrice: real("target_price"),
  timeHorizon: text("time_horizon"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  status: text("status").notNull(), // "active" | "closed" | "monitoring"
});

export const insertThesisSchema = createInsertSchema(theses).omit({ id: true });
export type InsertThesis = z.infer<typeof insertThesisSchema>;
export type Thesis = typeof theses.$inferSelect;

// News annotations
export const newsAnnotations = sqliteTable("news_annotations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  newsId: text("news_id").notNull(),
  headline: text("headline").notNull(),
  ticker: text("ticker"),
  signal: text("signal").notNull(), // "bullish" | "bearish" | "neutral"
  importance: integer("importance").notNull(), // 1-5
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const insertNewsAnnotationSchema = createInsertSchema(newsAnnotations).omit({ id: true });
export type InsertNewsAnnotation = z.infer<typeof insertNewsAnnotationSchema>;
export type NewsAnnotation = typeof newsAnnotations.$inferSelect;

// Analyst alerts
export const alerts = sqliteTable("alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticker: text("ticker").notNull(),
  alertType: text("alert_type").notNull(), // "price_above" | "price_below" | "earnings" | "news"
  threshold: real("threshold"),
  message: text("message").notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: text("created_at").notNull(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
