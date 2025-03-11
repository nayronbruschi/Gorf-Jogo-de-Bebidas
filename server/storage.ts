import { Player, InsertPlayer, GameSettings } from "@shared/schema";

export interface IStorage {
  // Players
  getPlayers(): Promise<Player[]>;
  addPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayerPoints(id: string, points: number, type: "challenge" | "drink"): Promise<Player>;
  getCurrentPlayer(): Promise<Player | undefined>;
  setNextPlayer(): Promise<Player | undefined>;
  removePlayer(id: string): Promise<void>;
  removeAllPlayers(): Promise<void>;
  resetPlayersPoints(): Promise<void>;
  setFirstPlayer(): Promise<Player | undefined>;
  getPlayer(id: string): Promise<Player | undefined>;

  // Game Settings
  getGameSettings(): Promise<GameSettings>;
  updateGameSettings(maxPoints: number): Promise<GameSettings>;
}

class MemStorage implements IStorage {
  private players: Player[] = [];
  private settings: GameSettings = {
    maxPoints: 100,
    currentPlayerId: null
  };

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async getPlayers(): Promise<Player[]> {
    return this.players;
  }

  async addPlayer(player: InsertPlayer): Promise<Player> {
    const newPlayer: Player = {
      id: this.generateId(),
      name: player.name,
      points: 0,
      isActive: true,
      challengesCompleted: 0,
      drinksCompleted: 0,
    };

    this.players.push(newPlayer);

    // Se for o primeiro jogador, define como jogador atual
    if (this.players.length === 1) {
      this.settings.currentPlayerId = newPlayer.id;
    }

    return newPlayer;
  }

  async updatePlayerPoints(id: string, points: number, type: "challenge" | "drink"): Promise<Player> {
    const player = this.players.find(p => p.id === id);
    if (!player) {
      throw new Error("Player not found");
    }

    player.points += points;
    if (type === "challenge") {
      player.challengesCompleted += 1;
    } else {
      player.drinksCompleted += points;
    }

    return player;
  }

  async getCurrentPlayer(): Promise<Player | undefined> {
    if (!this.settings.currentPlayerId) return undefined;
    return this.players.find(p => p.id === this.settings.currentPlayerId);
  }

  async setNextPlayer(): Promise<Player | undefined> {
    if (this.players.length === 0) return undefined;

    const currentIndex = this.players.findIndex(p => p.id === this.settings.currentPlayerId);
    const nextIndex = (currentIndex + 1) % this.players.length;
    const nextPlayer = this.players[nextIndex];

    this.settings.currentPlayerId = nextPlayer.id;
    return nextPlayer;
  }

  async removePlayer(id: string): Promise<void> {
    const index = this.players.findIndex(p => p.id === id);
    if (index === -1) return;

    // Se o jogador removido era o atual, passa para o próximo
    if (id === this.settings.currentPlayerId) {
      await this.setNextPlayer();
    }

    this.players.splice(index, 1);
  }

  async removeAllPlayers(): Promise<void> {
    this.players = [];
    this.settings.currentPlayerId = null;
  }

  async resetPlayersPoints(): Promise<void> {
    for (const player of this.players) {
      player.points = 0;
      player.challengesCompleted = 0;
      player.drinksCompleted = 0;
    }

    // Resetar o jogador atual para o primeiro da lista
    if (this.players.length > 0) {
      this.settings.currentPlayerId = this.players[0].id;
    }
  }

  async setFirstPlayer(): Promise<Player | undefined> {
    if (this.players.length === 0) return undefined;

    this.settings.currentPlayerId = this.players[0].id;
    return this.players[0];
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.find(p => p.id === id);
  }

  async getGameSettings(): Promise<GameSettings> {
    return this.settings;
  }

  async updateGameSettings(maxPoints: number): Promise<GameSettings> {
    this.settings.maxPoints = maxPoints;
    return this.settings;
  }
}

export const storage = new MemStorage();