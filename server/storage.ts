import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import {
  watchlistItems, theses, newsAnnotations, alerts,
  type WatchlistItem, type InsertWatchlistItem,
  type Thesis, type InsertThesis,
  type NewsAnnotation, type InsertNewsAnnotation,
  type Alert, type InsertAlert,
} from "@shared/schema";

const sqlite = new Database("kfund.db");
const db = drizzle(sqlite);

// Initialize tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS watchlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    company_name TEXT NOT NULL,
    sector TEXT,
    added_at TEXT NOT NULL,
    notes TEXT,
    target_price REAL,
    alert_price REAL
  );
  CREATE TABLE IF NOT EXISTS theses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    company_name TEXT NOT NULL,
    direction TEXT NOT NULL,
    conviction INTEGER NOT NULL,
    thesis TEXT NOT NULL,
    catalysts TEXT NOT NULL,
    risks TEXT NOT NULL,
    target_price REAL,
    time_horizon TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    status TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS news_annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    news_id TEXT NOT NULL,
    headline TEXT NOT NULL,
    ticker TEXT,
    signal TEXT NOT NULL,
    importance INTEGER NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    threshold REAL,
    message TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );
`);

export interface IStorage {
  // Watchlist
  getWatchlist(): WatchlistItem[];
  addToWatchlist(item: InsertWatchlistItem): WatchlistItem;
  removeFromWatchlist(id: number): void;
  updateWatchlistItem(id: number, updates: Partial<InsertWatchlistItem>): WatchlistItem | undefined;
  // Theses
  getTheses(): Thesis[];
  createThesis(thesis: InsertThesis): Thesis;
  updateThesis(id: number, updates: Partial<InsertThesis>): Thesis | undefined;
  deleteThesis(id: number): void;
  // News Annotations
  getNewsAnnotations(): NewsAnnotation[];
  createNewsAnnotation(annotation: InsertNewsAnnotation): NewsAnnotation;
  // Alerts
  getAlerts(): Alert[];
  createAlert(alert: InsertAlert): Alert;
  toggleAlert(id: number): Alert | undefined;
  deleteAlert(id: number): void;
}

class SqliteStorage implements IStorage {
  getWatchlist() { return db.select().from(watchlistItems).all(); }
  addToWatchlist(item: InsertWatchlistItem) {
    return db.insert(watchlistItems).values(item).returning().get();
  }
  removeFromWatchlist(id: number) {
    db.delete(watchlistItems).where(eq(watchlistItems.id, id)).run();
  }
  updateWatchlistItem(id: number, updates: Partial<InsertWatchlistItem>) {
    return db.update(watchlistItems).set(updates).where(eq(watchlistItems.id, id)).returning().get();
  }
  getTheses() { return db.select().from(theses).all(); }
  createThesis(thesis: InsertThesis) {
    return db.insert(theses).values(thesis).returning().get();
  }
  updateThesis(id: number, updates: Partial<InsertThesis>) {
    return db.update(theses).set(updates).where(eq(theses.id, id)).returning().get();
  }
  deleteThesis(id: number) {
    db.delete(theses).where(eq(theses.id, id)).run();
  }
  getNewsAnnotations() { return db.select().from(newsAnnotations).all(); }
  createNewsAnnotation(annotation: InsertNewsAnnotation) {
    return db.insert(newsAnnotations).values(annotation).returning().get();
  }
  getAlerts() { return db.select().from(alerts).all(); }
  createAlert(alert: InsertAlert) {
    return db.insert(alerts).values(alert).returning().get();
  }
  toggleAlert(id: number) {
    const current = db.select().from(alerts).where(eq(alerts.id, id)).get();
    if (!current) return undefined;
    return db.update(alerts).set({ isActive: current.isActive ? 0 : 1 }).where(eq(alerts.id, id)).returning().get();
  }
  deleteAlert(id: number) {
    db.delete(alerts).where(eq(alerts.id, id)).run();
  }
}

export const storage = new SqliteStorage();
