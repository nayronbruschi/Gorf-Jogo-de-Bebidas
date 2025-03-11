import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, insertCustomGameSchema, updatePlayerPointsSchema, gameSettingsSchema } from "@shared/schema";

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
      res.json(player);
    } catch (error) {
      console.error('Erro ao definir próximo jogador:', error);
      res.status(500).json({ message: "Erro ao definir próximo jogador" });
    }
  });

  // Importante: Colocar a rota "all" antes da rota com :id
  app.delete("/api/players/all", async (_req, res) => {
    try {
      await storage.removeAllPlayers();
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao remover todos os jogadores:', error);
      res.status(500).json({ message: "Erro ao remover jogadores" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const player = await storage.getPlayer(id);
      console.log('Retornando dados do jogador:', player);

      if (!player) {
        return res.status(404).json({ message: "Jogador não encontrado" });
      }

      res.json(player);
    } catch (error) {
      console.error('Erro ao buscar jogador:', error);
      res.status(500).json({ message: "Erro ao buscar jogador" });
    }
  });

  app.patch("/api/players/:id/points", async (req, res) => {
    try {
      const result = updatePlayerPointsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Dados inválidos" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const player = await storage.updatePlayerPoints(id, result.data.points, result.data.type);
      res.json(player);
    } catch (error) {
      console.error('Erro ao atualizar pontos do jogador:', error);
      res.status(404).json({ message: "Jogador não encontrado" });
    }
  });

  app.delete("/api/players/:id", async (req, res) => {
    try {
      const id = req.params.id; // Removida a conversão para número
      await storage.removePlayer(id);
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      res.status(404).json({ message: "Jogador não encontrado" });
    }
  });

  // Game players routes
  app.post("/api/players/reset", async (_req, res) => {
    try {
      await storage.resetPlayersPoints();
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao resetar pontuações:', error);
      res.status(500).json({ message: "Erro ao resetar pontuações" });
    }
  });

  // Game Settings routes
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

  // Custom game routes
  app.get("/api/custom-games", async (_req, res) => {
    try {
      const games = await storage.getCustomGames();
      res.json(games);
    } catch (error) {
      console.error('Erro ao buscar jogos customizados:', error);
      res.status(500).json({ message: "Erro ao buscar jogos customizados" });
    }
  });

  app.post("/api/custom-games", async (req, res) => {
    try {
      const result = insertCustomGameSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Dados do jogo inválidos" });
      }
      const game = await storage.addCustomGame(result.data);
      res.json(game);
    } catch (error) {
      console.error('Erro ao adicionar jogo customizado:', error);
      res.status(500).json({ message: "Erro ao adicionar jogo customizado" });
    }
  });

  app.get("/api/custom-games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      const game = await storage.getCustomGame(id);
      if (!game) {
        return res.status(404).json({ message: "Jogo não encontrado" });
      }
      res.json(game);
    } catch (error) {
      console.error('Erro ao buscar jogo customizado:', error);
      res.status(500).json({ message: "Erro ao buscar jogo customizado" });
    }
  });

  app.delete("/api/custom-games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      await storage.deleteCustomGame(id);
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao remover jogo customizado:', error);
      res.status(404).json({ message: "Jogo não encontrado" });
    }
  });

  return httpServer;
}