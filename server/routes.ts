import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, updatePlayerPointsSchema, gameSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Player routes
  app.get("/api/players", async (_req, res) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error);
      res.status(500).json({ message: "Erro ao buscar jogadores" });
    }
  });

  app.post("/api/players", async (req, res) => {
    try {
      console.log("Recebendo requisição para adicionar jogador:", req.body);
      const result = insertPlayerSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Erro de validação:", result.error);
        return res.status(400).json({ message: "Nome do jogador é obrigatório" });
      }

      const player = await storage.addPlayer(result.data);
      console.log("Jogador adicionado com sucesso:", player);
      res.json(player);
    } catch (error) {
      console.error('Erro ao adicionar jogador:', error);
      res.status(500).json({ message: "Erro ao adicionar jogador" });
    }
  });

  app.get("/api/players/current", async (_req, res) => {
    try {
      const player = await storage.getCurrentPlayer();
      if (!player) {
        return res.status(404).json({ message: "Nenhum jogador atual" });
      }
      console.log("Jogador atual:", player); // Debug log
      res.json(player);
    } catch (error) {
      console.error('Erro ao buscar jogador atual:', error);
      res.status(500).json({ message: "Erro ao buscar jogador atual" });
    }
  });

  app.post("/api/players/first", async (_req, res) => {
    try {
      const player = await storage.setFirstPlayer();
      if (!player) {
        return res.status(404).json({ message: "Nenhum jogador disponível" });
      }
      console.log("Primeiro jogador definido:", player); // Debug log
      res.json(player);
    } catch (error) {
      console.error('Erro ao definir primeiro jogador:', error);
      res.status(500).json({ message: "Erro ao definir primeiro jogador" });
    }
  });

  app.post("/api/players/next", async (_req, res) => {
    try {
      const player = await storage.setNextPlayer();
      if (!player) {
        return res.status(404).json({ message: "Nenhum jogador disponível" });
      }
      console.log("Próximo jogador definido:", player); // Debug log
      res.json(player);
    } catch (error) {
      console.error('Erro ao definir próximo jogador:', error);
      res.status(500).json({ message: "Erro ao definir próximo jogador" });
    }
  });

  app.delete("/api/players/all", async (_req, res) => {
    try {
      await storage.removeAllPlayers();
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao remover todos os jogadores:', error);
      res.status(500).json({ message: "Erro ao remover jogadores" });
    }
  });

  app.patch("/api/players/:id/points", async (req, res) => {
    try {
      const result = updatePlayerPointsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Dados inválidos" });
      }

      const id = req.params.id;
      const player = await storage.updatePlayerPoints(id, result.data.points, result.data.type);
      console.log("Pontos atualizados para o jogador:", player); // Debug log
      res.json(player);
    } catch (error) {
      console.error('Erro ao atualizar pontos do jogador:', error);
      res.status(404).json({ message: "Jogador não encontrado" });
    }
  });

  app.delete("/api/players/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await storage.removePlayer(id);
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      res.status(404).json({ message: "Jogador não encontrado" });
    }
  });

  app.post("/api/players/reset", async (_req, res) => {
    try {
      await storage.resetPlayersPoints();
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao resetar pontuações:', error);
      res.status(500).json({ message: "Erro ao resetar pontuações" });
    }
  });

  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getGameSettings();
      res.json(settings);
    } catch (error) {
      console.error('Erro ao buscar configurações do jogo:', error);
      res.status(500).json({ message: "Erro ao buscar configurações do jogo" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const result = gameSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Pontuação máxima inválida" });
      }
      const settings = await storage.updateGameSettings(result.data.maxPoints);
      res.json(settings);
    } catch (error) {
      console.error('Erro ao atualizar configurações do jogo:', error);
      res.status(500).json({ message: "Erro ao atualizar configurações do jogo" });
    }
  });

  return httpServer;
}