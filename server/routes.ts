import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPlayerSchema, updatePlayerPointsSchema, gameSettingsSchema } from "@shared/schema";
import multer from "multer";
import fs from "fs";
import path from "path";
import sharp from "sharp";
// @ts-ignore - não há tipos para rembg-node
import { Rembg } from "rembg-node";

// Configurar o multer para armazenar os arquivos temporariamente
const upload = multer({ dest: 'tmp/uploads/' });

const BUCKET_PATH = "replit-objstore-40b80319-33b5-4913-8c43-e847afc83215";

// Estender o tipo de Express Request para incluir userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Middleware para verificar se o userId está presente
  const requireUserId = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }
    req.userId = userId;
    next();
  };

  // Player routes
  app.get("/api/players", requireUserId, async (req, res) => {
    try {
      const players = await storage.getPlayers(req.userId);
      res.json(players);
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error);
      res.status(500).json({ message: "Erro ao buscar jogadores" });
    }
  });

  app.post("/api/players", requireUserId, async (req, res) => {
    try {
      const result = insertPlayerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Nome do jogador é obrigatório" });
      }

      const player = await storage.addPlayer(req.userId, result.data);
      res.json(player);
    } catch (error) {
      console.error('Erro ao adicionar jogador:', error);
      res.status(500).json({ message: "Erro ao adicionar jogador" });
    }
  });

  app.get("/api/players/current", requireUserId, async (req, res) => {
    try {
      const player = await storage.getCurrentPlayer(req.userId);
      if (!player) {
        return res.status(404).json({ message: "Nenhum jogador atual" });
      }
      res.json(player);
    } catch (error) {
      console.error('Erro ao buscar jogador atual:', error);
      res.status(500).json({ message: "Erro ao buscar jogador atual" });
    }
  });

  app.post("/api/players/first", requireUserId, async (req, res) => {
    try {
      const player = await storage.setFirstPlayer(req.userId);
      if (!player) {
        return res.status(404).json({ message: "Nenhum jogador disponível" });
      }
      res.json(player);
    } catch (error) {
      console.error('Erro ao definir primeiro jogador:', error);
      res.status(500).json({ message: "Erro ao definir primeiro jogador" });
    }
  });

  app.post("/api/players/next", requireUserId, async (req, res) => {
    try {
      const player = await storage.setNextPlayer(req.userId);
      if (!player) {
        return res.status(404).json({ message: "Nenhum jogador disponível" });
      }
      res.json(player);
    } catch (error) {
      console.error('Erro ao definir próximo jogador:', error);
      res.status(500).json({ message: "Erro ao definir próximo jogador" });
    }
  });

  app.delete("/api/players/all", requireUserId, async (req, res) => {
    try {
      await storage.removeAllPlayers(req.userId);
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao remover todos os jogadores:', error);
      res.status(500).json({ message: "Erro ao remover jogadores" });
    }
  });

  app.patch("/api/players/:id/points", requireUserId, async (req, res) => {
    try {
      const result = updatePlayerPointsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Dados inválidos" });
      }

      const id = req.params.id;
      const player = await storage.updatePlayerPoints(req.userId, id, result.data.points, result.data.type);
      res.json(player);
    } catch (error) {
      console.error('Erro ao atualizar pontos do jogador:', error);
      res.status(404).json({ message: "Jogador não encontrado" });
    }
  });

  app.delete("/api/players/:id", requireUserId, async (req, res) => {
    try {
      const id = req.params.id;
      await storage.removePlayer(req.userId, id);
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      res.status(404).json({ message: "Jogador não encontrado" });
    }
  });

  app.post("/api/players/reset", requireUserId, async (req, res) => {
    try {
      await storage.resetPlayersPoints(req.userId);
      res.status(204).end();
    } catch (error) {
      console.error('Erro ao resetar pontuações:', error);
      res.status(500).json({ message: "Erro ao resetar pontuações" });
    }
  });

  app.get("/api/settings", requireUserId, async (req, res) => {
    try {
      const settings = await storage.getGameSettings(req.userId);
      res.json(settings);
    } catch (error) {
      console.error('Erro ao buscar configurações do jogo:', error);
      res.status(500).json({ message: "Erro ao buscar configurações do jogo" });
    }
  });

  app.patch("/api/settings", requireUserId, async (req, res) => {
    try {
      const result = gameSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Pontuação máxima inválida" });
      }
      const settings = await storage.updateGameSettings(req.userId, result.data.maxPoints);
      res.json(settings);
    } catch (error) {
      console.error('Erro ao atualizar configurações do jogo:', error);
      res.status(500).json({ message: "Erro ao atualizar configurações do jogo" });
    }
  });

  // Rota de upload de imagens
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      const file = req.file;
      // Tornar o nome do arquivo único usando timestamp
      const uniqueFilename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
      const destPath = path.join(BUCKET_PATH, uniqueFilename);

      // Garantir que o diretório existe
      const dir = path.dirname(destPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Mover o arquivo para o bucket
      fs.renameSync(file.path, destPath);
      console.log('Arquivo movido para:', destPath);

      // Retornar a URL do arquivo
      const url = `/api/images/${uniqueFilename}`;
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

      // Salvar os textos diretamente do body
      fs.writeFileSync(bannersTextPath, JSON.stringify(req.body, null, 2));
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

  // Rota para salvar as tags de destaque
  app.post("/api/featured-tags", async (req, res) => {
    try {
      const featuredTagsPath = path.join(BUCKET_PATH, "featured_tags.json");
      
      // Verifica se o diretório existe, caso contrário cria
      const dir = path.dirname(featuredTagsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Salva as tags de destaque no arquivo
      fs.writeFileSync(featuredTagsPath, JSON.stringify(req.body, null, 2));
      console.log('Tags de destaque salvas em:', featuredTagsPath);
      res.json({ message: "Tags de destaque atualizadas com sucesso" });
    } catch (error) {
      console.error('Erro ao salvar tags de destaque:', error);
      res.status(500).json({ message: "Erro ao salvar tags de destaque" });
    }
  });

  // Rota para obter as tags de destaque
  app.get("/api/featured-tags", (req, res) => {
    try {
      const featuredTagsPath = path.join(BUCKET_PATH, "featured_tags.json");
      if (fs.existsSync(featuredTagsPath)) {
        const tags = JSON.parse(fs.readFileSync(featuredTagsPath, 'utf-8'));
        res.json(tags);
      } else {
        // Retorna objeto vazio se o arquivo não existir
        res.json({});
      }
    } catch (error) {
      console.error('Erro ao obter tags de destaque:', error);
      res.status(500).json({ message: "Erro ao obter tags de destaque" });
    }
  });
  
  // Rota para upload de imagem para a garrafa (apenas redimensionamento)
  app.post("/api/upload-bottle-image", upload.single('file'), async (req, res) => {
    let tempFile = null;
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      tempFile = req.file;
      
      // Processar a imagem com sharp (apenas redimensionamento)
      console.log('Processando imagem...');
      
      // Ler o arquivo para um buffer
      const inputBuffer = fs.readFileSync(tempFile.path);
      
      // Redimensionar a imagem para um tamanho adequado
      const outputBuffer = await sharp(inputBuffer)
        .resize({
          width: 500,
          height: 500,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Fundo transparente
        })
        .toFormat('png')
        .toBuffer();
      
      // Gerar um nome de arquivo único
      const uniqueFilename = `bottle-${Date.now()}.png`;
      const destPath = path.join(BUCKET_PATH, uniqueFilename);
      
      // Garantir que o diretório existe
      const dir = path.dirname(destPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Salvar a imagem processada
      fs.writeFileSync(destPath, outputBuffer);
      console.log('Imagem salva em:', destPath);
      
      // Remover o arquivo temporário original
      try {
        if (tempFile && fs.existsSync(tempFile.path)) {
          fs.unlinkSync(tempFile.path);
        }
      } catch (unlinkError) {
        console.warn('Aviso: não foi possível excluir o arquivo temporário', unlinkError);
      }
      
      // Retornar a URL da imagem processada
      const url = `/api/images/${uniqueFilename}`;
      res.json({ 
        url,
        message: 'Imagem processada com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao processar imagem para garrafa:', error);
      
      // Tentar excluir o arquivo temporário em caso de erro
      try {
        if (tempFile && fs.existsSync(tempFile.path)) {
          fs.unlinkSync(tempFile.path);
        }
      } catch (unlinkError) {
        console.warn('Aviso: não foi possível excluir o arquivo temporário', unlinkError);
      }
      
      res.status(500).json({ 
        message: "Erro ao processar imagem da garrafa", 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
  
  // Rota para obter a imagem da garrafa atual
  app.get("/api/bottle-image", (req, res) => {
    try {
      // Verifica se existe uma imagem personalizada para a garrafa
      const bottlePath = path.join(BUCKET_PATH, "user_bottle_image.json");
      
      if (fs.existsSync(bottlePath)) {
        const bottleData = JSON.parse(fs.readFileSync(bottlePath, 'utf-8'));
        res.json(bottleData);
      } else {
        // Retorna a URL da garrafa padrão (imagem local)
        res.json({ 
          url: "/api/images/default-bottle.webp" 
        });
      }
    } catch (error) {
      console.error('Erro ao obter imagem da garrafa:', error);
      res.status(500).json({ message: "Erro ao obter imagem da garrafa" });
    }
  });
  
  // Rota para salvar a referência à imagem da garrafa atual
  app.post("/api/bottle-image", (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL da imagem não fornecida" });
      }
      
      const bottlePath = path.join(BUCKET_PATH, "user_bottle_image.json");
      
      // Garantir que o diretório existe
      const dir = path.dirname(bottlePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Salvar a referência à imagem da garrafa
      fs.writeFileSync(bottlePath, JSON.stringify({ url }, null, 2));
      console.log('Referência à imagem da garrafa salva:', url);
      
      res.json({ message: "Imagem da garrafa atualizada com sucesso", url });
    } catch (error) {
      console.error('Erro ao salvar imagem da garrafa:', error);
      res.status(500).json({ message: "Erro ao salvar imagem da garrafa" });
    }
  });

  return httpServer;
}