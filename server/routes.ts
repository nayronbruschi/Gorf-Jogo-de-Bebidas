import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertCustomGameSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Player routes
  app.get("/api/players", async (_req, res) => {
    const players = await storage.getPlayers();
    res.json(players);
  });

  app.post("/api/players", async (req, res) => {
    const result = insertPlayerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Nome do jogador é obrigatório" });
    }
    const player = await storage.addPlayer(result.data);
    res.json(player);
  });

  app.patch("/api/players/:id/points", async (req, res) => {
    const { points } = req.body;
    const id = parseInt(req.params.id);
    if (isNaN(id) || typeof points !== "number") {
      return res.status(400).json({ message: "ID e pontos inválidos" });
    }
    try {
      const player = await storage.updatePlayerPoints(id, points);
      res.json(player);
    } catch (error) {
      res.status(404).json({ message: "Jogador não encontrado" });
    }
  });

  app.delete("/api/players/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    try {
      await storage.removePlayer(id);
      res.status(204).end();
    } catch (error) {
      res.status(404).json({ message: "Jogador não encontrado" });
    }
  });

  // Custom game routes
  app.get("/api/custom-games", async (_req, res) => {
    const games = await storage.getCustomGames();
    res.json(games);
  });

  app.post("/api/custom-games", async (req, res) => {
    const result = insertCustomGameSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Dados do jogo inválidos" });
    }
    const game = await storage.addCustomGame(result.data);
    res.json(game);
  });

  app.get("/api/custom-games/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    const game = await storage.getCustomGame(id);
    if (!game) {
      return res.status(404).json({ message: "Jogo não encontrado" });
    }
    res.json(game);
  });

  app.delete("/api/custom-games/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    try {
      await storage.deleteCustomGame(id);
      res.status(204).end();
    } catch (error) {
      res.status(404).json({ message: "Jogo não encontrado" });
    }
  });

  return httpServer;
}
