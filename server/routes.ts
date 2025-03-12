import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, updatePlayerPointsSchema, gameSettingsSchema } from "@shared/schema";
import multer from "multer";
import fs from "fs";
import path from "path";

// Configurar o multer para armazenar os arquivos temporariamente
const upload = multer({ dest: 'tmp/uploads/' });

const BUCKET_PATH = "replit-objstore-40b80319-33b5-4913-8c43-e847afc83215";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Rota de upload de imagens
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      const file = req.file;
      const destPath = path.join(BUCKET_PATH, file.originalname);

      // Garantir que o diretório existe
      const dir = path.dirname(destPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Mover o arquivo para o bucket
      fs.renameSync(file.path, destPath);
      console.log('Arquivo movido para:', destPath);

      // Retornar a URL do arquivo
      const url = `/api/images/${file.originalname}`;
      res.json({ url });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ message: "Erro ao fazer upload do arquivo" });
    }
  });

  // Rota para servir as imagens
  app.get("/api/images/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(BUCKET_PATH, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Imagem não encontrada" });
    }

    res.sendFile(filePath, { root: process.cwd() });
  });

  // Rota para salvar os banners ativos
  app.post("/api/banners", async (req, res) => {
    try {
      const bannersPath = path.join(BUCKET_PATH, "active_banners.json");

      // Garantir que o diretório existe
      const dir = path.dirname(bannersPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(bannersPath, JSON.stringify(req.body.banners, null, 2));
      console.log('Banners salvos em:', bannersPath);
      res.json({ message: "Banners atualizados com sucesso" });
    } catch (error) {
      console.error('Erro ao salvar banners:', error);
      res.status(500).json({ message: "Erro ao salvar banners" });
    }
  });

  // Rota para obter os banners ativos
  app.get("/api/banners", (req, res) => {
    try {
      const bannersPath = path.join(BUCKET_PATH, "active_banners.json");
      if (fs.existsSync(bannersPath)) {
        const banners = JSON.parse(fs.readFileSync(bannersPath, 'utf-8'));
        res.json(banners);
      } else {
        res.json({}); // Retorna objeto vazio se não houver banners salvos
      }
    } catch (error) {
      console.error('Erro ao obter banners:', error);
      res.status(500).json({ message: "Erro ao obter banners" });
    }
  });

  // Adicionar nova rota para os textos dos banners
  app.post("/api/banner-texts", async (req, res) => {
    try {
      const bannersTextPath = path.join(BUCKET_PATH, "banner_texts.json");

      // Garantir que o diretório existe
      const dir = path.dirname(bannersTextPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(bannersTextPath, JSON.stringify(req.body.bannerTexts, null, 2));
      console.log('Textos dos banners salvos em:', bannersTextPath);
      res.json({ message: "Textos dos banners atualizados com sucesso" });
    } catch (error) {
      console.error('Erro ao salvar textos dos banners:', error);
      res.status(500).json({ message: "Erro ao salvar textos dos banners" });
    }
  });

  // Rota para obter os textos dos banners
  app.get("/api/banner-texts", (req, res) => {
    try {
      const bannersTextPath = path.join(BUCKET_PATH, "banner_texts.json");
      if (fs.existsSync(bannersTextPath)) {
        const texts = JSON.parse(fs.readFileSync(bannersTextPath, 'utf-8'));
        res.json(texts);
      } else {
        // Retorna textos padrão se o arquivo não existir
        res.json({
          "1": { title: "Bem-vindo ao Gorf", description: "O melhor app para suas festas" },
          "2": { title: "Diversão Garantida", description: "Jogos para todos os momentos" }
        });
      }
    } catch (error) {
      console.error('Erro ao obter textos dos banners:', error);
      res.status(500).json({ message: "Erro ao obter textos dos banners" });
    }
  });

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