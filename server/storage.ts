import { players, customGames, type Player, type InsertPlayer, type CustomGame, type InsertCustomGame } from "@shared/schema";

export interface IStorage {
  // Players
  getPlayers(): Promise<Player[]>;
  addPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayerPoints(id: number, points: number): Promise<Player>;
  removePlayer(id: number): Promise<void>;
  
  // Custom Games
  getCustomGames(): Promise<CustomGame[]>;
  addCustomGame(game: InsertCustomGame): Promise<CustomGame>;
  getCustomGame(id: number): Promise<CustomGame | undefined>;
  deleteCustomGame(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private players: Map<number, Player>;
  private customGames: Map<number, CustomGame>;
  private playerIdCounter: number;
  private gameIdCounter: number;

  constructor() {
    this.players = new Map();
    this.customGames = new Map();
    this.playerIdCounter = 1;
    this.gameIdCounter = 1;
  }

  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async addPlayer(player: InsertPlayer): Promise<Player> {
    const newPlayer: Player = {
      id: this.playerIdCounter++,
      name: player.name,
      points: 0,
      isActive: true,
    };
    this.players.set(newPlayer.id, newPlayer);
    return newPlayer;
  }

  async updatePlayerPoints(id: number, points: number): Promise<Player> {
    const player = this.players.get(id);
    if (!player) throw new Error("Player not found");
    
    const updatedPlayer = { ...player, points };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async removePlayer(id: number): Promise<void> {
    if (!this.players.delete(id)) {
      throw new Error("Player not found");
    }
  }

  async getCustomGames(): Promise<CustomGame[]> {
    return Array.from(this.customGames.values());
  }

  async addCustomGame(game: InsertCustomGame): Promise<CustomGame> {
    const newGame: CustomGame = {
      id: this.gameIdCounter++,
      ...game,
    };
    this.customGames.set(newGame.id, newGame);
    return newGame;
  }

  async getCustomGame(id: number): Promise<CustomGame | undefined> {
    return this.customGames.get(id);
  }

  async deleteCustomGame(id: number): Promise<void> {
    if (!this.customGames.delete(id)) {
      throw new Error("Custom game not found");
    }
  }
}

export const storage = new MemStorage();
