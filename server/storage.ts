import { players, customGames, gameSettings, type Player, type InsertPlayer, type CustomGame, type InsertCustomGame, type GameSettings } from "@shared/schema";

export interface IStorage {
  // Players
  getPlayers(): Promise<Player[]>;
  addPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayerPoints(id: number, points: number, type: "challenge" | "drink"): Promise<Player>;
  getCurrentPlayer(): Promise<Player | undefined>;
  setNextPlayer(): Promise<Player | undefined>;
  removePlayer(id: number): Promise<void>;
  removeAllPlayers(): Promise<void>; // Added removeAllPlayers method signature

  // Game Settings
  getGameSettings(): Promise<GameSettings>;
  updateGameSettings(maxPoints: number): Promise<GameSettings>;

  // Custom Games
  getCustomGames(): Promise<CustomGame[]>;
  addCustomGame(game: InsertCustomGame): Promise<CustomGame>;
  getCustomGame(id: number): Promise<CustomGame | undefined>;
  deleteCustomGame(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private players: Map<number, Player>;
  private customGames: Map<number, CustomGame>;
  private settings: GameSettings;
  private playerIdCounter: number;
  private gameIdCounter: number;

  constructor() {
    this.players = new Map();
    this.customGames = new Map();
    this.playerIdCounter = 1;
    this.gameIdCounter = 1;
    this.settings = {
      id: 1,
      maxPoints: 100,
      currentPlayerId: undefined,
    };
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
      challengesCompleted: 0,
      drinksCompleted: 0,
    };
    this.players.set(newPlayer.id, newPlayer);

    // Se for o primeiro jogador, define como jogador atual
    if (this.players.size === 1) {
      this.settings.currentPlayerId = newPlayer.id;
    }

    return newPlayer;
  }

  async updatePlayerPoints(id: number, points: number, type: "challenge" | "drink"): Promise<Player> {
    const player = this.players.get(id);
    if (!player) throw new Error("Player not found");

    const updatedPlayer = {
      ...player,
      points: (player.points || 0) + points,
      challengesCompleted: type === "challenge" ? (player.challengesCompleted || 0) + 1 : (player.challengesCompleted || 0),
      drinksCompleted: type === "drink" ? (player.drinksCompleted || 0) + 1 : (player.drinksCompleted || 0),
    };

    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async getCurrentPlayer(): Promise<Player | undefined> {
    if (!this.settings.currentPlayerId) return undefined;
    return this.players.get(this.settings.currentPlayerId);
  }

  async setNextPlayer(): Promise<Player | undefined> {
    const players = Array.from(this.players.values());
    if (players.length === 0) return undefined;

    const currentIndex = players.findIndex(p => p.id === this.settings.currentPlayerId);
    const nextIndex = (currentIndex + 1) % players.length;
    const nextPlayer = players[nextIndex];

    this.settings.currentPlayerId = nextPlayer.id;
    return nextPlayer;
  }

  async removePlayer(id: number): Promise<void> {
    if (!this.players.delete(id)) {
      throw new Error("Player not found");
    }

    // Se o jogador removido era o atual, passa para o próximo
    if (this.settings.currentPlayerId === id) {
      await this.setNextPlayer();
    }
  }

  async getGameSettings(): Promise<GameSettings> {
    return this.settings;
  }

  async updateGameSettings(maxPoints: number): Promise<GameSettings> {
    this.settings = {
      ...this.settings,
      maxPoints,
    };
    return this.settings;
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

  async removeAllPlayers(): Promise<void> { // Added removeAllPlayers method implementation
    this.players.clear();
    this.settings.currentPlayerId = undefined;
  }
}

export const storage = new MemStorage();