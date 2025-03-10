import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertCustomGameSchema, updatePlayerPointsSchema, gameSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Player routes
  app.get("/api/players", async (_req, res) => {
    const players = await storage.getPlayers();
    res.json(players);
  });

  app.get("/api/players/current", async (_req, res) => {
    const player = await storage.getCurrentPlayer();
    if (!player) {
      return res.status(404).json({ message: "Nenhum jogador atual" });
    }
    res.json(player);
  });

  app.post("/api/players/first", async (_req, res) => {
    const player = await storage.setFirstPlayer();
    if (!player) {
      return res.status(404).json({ message: "Nenhum jogador disponível" });
    }
    res.json(player);
  });

  app.post("/api/players/next", async (_req, res) => {
    const player = await storage.setNextPlayer();
    if (!player) {
      return res.status(404).json({ message: "Nenhum jogador disponível" });
    }
    res.json(player);
  });

  app.get("/api/players/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    const player = await storage.getPlayer(id);
    if (!player) {
      return res.status(404).json({ message: "Jogador não encontrado" });
    }
    res.json(player);
  });

  // Importante: Colocar a rota "all" antes da rota com :id
  app.delete("/api/players/all", async (_req, res) => {
    try {
      await storage.removeAllPlayers();
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Erro ao remover jogadores" });
    }
  });

  app.post("/api/players", async (req, res) => {
    const result = insertPlayerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Nome do jogador é obrigatório e deve ter entre 1 e 30 caracteres" });
    }

    // Validação adicional do nome
    if (!result.data.name.trim()) {
      return res.status(400).json({ message: "Nome do jogador não pode estar vazio" });
    }

    const player = await storage.addPlayer(result.data);
    res.json(player);
  });

  app.patch("/api/players/:id/points", async (req, res) => {
    const result = updatePlayerPointsSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    try {
      const player = await storage.updatePlayerPoints(id, result.data.points, result.data.type);
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

  // Game players routes
  app.post("/api/players/reset", async (_req, res) => {
    try {
      await storage.resetPlayersPoints();
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Erro ao resetar pontuações" });
    }
  });

  // Game Settings routes
  app.get("/api/settings", async (_req, res) => {
    const settings = await storage.getGameSettings();
    res.json(settings);
  });

  app.patch("/api/settings", async (req, res) => {
    const result = gameSettingsSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Pontuação máxima inválida" });
    }
    const settings = await storage.updateGameSettings(result.data.maxPoints);
    res.json(settings);
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