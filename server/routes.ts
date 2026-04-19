import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertWatchlistItemSchema, insertThesisSchema, insertNewsAnnotationSchema, insertAlertSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // --- Watchlist ---
  app.get("/api/watchlist", (_req, res) => {
    res.json(storage.getWatchlist());
  });
  app.post("/api/watchlist", (req, res) => {
    const parsed = insertWatchlistItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    res.json(storage.addToWatchlist(parsed.data));
  });
  app.delete("/api/watchlist/:id", (req, res) => {
    storage.removeFromWatchlist(Number(req.params.id));
    res.json({ success: true });
  });
  app.patch("/api/watchlist/:id", (req, res) => {
    const updated = storage.updateWatchlistItem(Number(req.params.id), req.body);
    res.json(updated);
  });

  // --- Theses ---
  app.get("/api/theses", (_req, res) => {
    res.json(storage.getTheses());
  });
  app.post("/api/theses", (req, res) => {
    const parsed = insertThesisSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    res.json(storage.createThesis(parsed.data));
  });
  app.patch("/api/theses/:id", (req, res) => {
    const updated = storage.updateThesis(Number(req.params.id), req.body);
    res.json(updated);
  });
  app.delete("/api/theses/:id", (req, res) => {
    storage.deleteThesis(Number(req.params.id));
    res.json({ success: true });
  });

  // --- News Annotations ---
  app.get("/api/annotations", (_req, res) => {
    res.json(storage.getNewsAnnotations());
  });
  app.post("/api/annotations", (req, res) => {
    const parsed = insertNewsAnnotationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    res.json(storage.createNewsAnnotation(parsed.data));
  });

  // --- Alerts ---
  app.get("/api/alerts", (_req, res) => {
    res.json(storage.getAlerts());
  });
  app.post("/api/alerts", (req, res) => {
    const parsed = insertAlertSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    res.json(storage.createAlert(parsed.data));
  });
  app.patch("/api/alerts/:id/toggle", (req, res) => {
    res.json(storage.toggleAlert(Number(req.params.id)));
  });
  app.delete("/api/alerts/:id", (req, res) => {
    storage.deleteAlert(Number(req.params.id));
    res.json({ success: true });
  });

  return httpServer;
}
