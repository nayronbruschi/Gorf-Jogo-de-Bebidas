import { Player, InsertPlayer, GameSettings } from "@shared/schema";

export interface IStorage {
  // Players
  getPlayers(userId: string): Promise<Player[]>;
  addPlayer(userId: string, player: InsertPlayer): Promise<Player>;
  updatePlayerPoints(userId: string, id: string, points: number, type: "challenge" | "drink"): Promise<Player>;
  getCurrentPlayer(userId: string): Promise<Player | undefined>;
  setNextPlayer(userId: string): Promise<Player | undefined>;
  removePlayer(userId: string, id: string): Promise<void>;
  removeAllPlayers(userId: string): Promise<void>;
  resetPlayersPoints(userId: string): Promise<void>;
  setFirstPlayer(userId: string): Promise<Player | undefined>;
  getPlayer(userId: string, id: string): Promise<Player | undefined>;

  // Game Settings
  getGameSettings(userId: string): Promise<GameSettings>;
  updateGameSettings(userId: string, maxPoints: number): Promise<GameSettings>;
}

interface UserGameState {
  players: Player[];
  settings: GameSettings;
}

class MemStorage implements IStorage {
  private userStates: Map<string, UserGameState> = new Map();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getUserState(userId: string): UserGameState {
    if (!this.userStates.has(userId)) {
      this.userStates.set(userId, {
        players: [],
        settings: {
          maxPoints: 100,
          currentPlayerId: null
        }
      });
    }
    return this.userStates.get(userId)!;
  }

  async getPlayers(userId: string): Promise<Player[]> {
    return this.getUserState(userId).players;
  }

  async addPlayer(userId: string, player: InsertPlayer): Promise<Player> {
    const state = this.getUserState(userId);
    const newPlayer: Player = {
      id: this.generateId(),
      name: player.name,
      points: 0,
      isActive: true,
      challengesCompleted: 0,
      drinksCompleted: 0,
    };

    state.players.push(newPlayer);

    // Se for o primeiro jogador, define como jogador atual
    if (state.players.length === 1) {
      state.settings.currentPlayerId = newPlayer.id;
    }

    return newPlayer;
  }

  async updatePlayerPoints(userId: string, id: string, points: number, type: "challenge" | "drink"): Promise<Player> {
    const state = this.getUserState(userId);
    const player = state.players.find(p => p.id === id);
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

  async getCurrentPlayer(userId: string): Promise<Player | undefined> {
    const state = this.getUserState(userId);
    if (!state.settings.currentPlayerId) return undefined;
    return state.players.find(p => p.id === state.settings.currentPlayerId);
  }

  async setNextPlayer(userId: string): Promise<Player | undefined> {
    const state = this.getUserState(userId);
    if (state.players.length === 0) return undefined;

    const currentIndex = state.players.findIndex(p => p.id === state.settings.currentPlayerId);
    const nextIndex = (currentIndex + 1) % state.players.length;
    const nextPlayer = state.players[nextIndex];

    state.settings.currentPlayerId = nextPlayer.id;
    return nextPlayer;
  }

  async removePlayer(userId: string, id: string): Promise<void> {
    const state = this.getUserState(userId);
    const index = state.players.findIndex(p => p.id === id);
    if (index === -1) return;

    // Se o jogador removido era o atual, passa para o próximo
    if (id === state.settings.currentPlayerId) {
      await this.setNextPlayer(userId);
    }

    state.players.splice(index, 1);
  }

  async removeAllPlayers(userId: string): Promise<void> {
    const state = this.getUserState(userId);
    state.players = [];
    state.settings.currentPlayerId = null;
  }

  async resetPlayersPoints(userId: string): Promise<void> {
    const state = this.getUserState(userId);
    for (const player of state.players) {
      player.points = 0;
      player.challengesCompleted = 0;
      player.drinksCompleted = 0;
    }

    // Resetar o jogador atual para o primeiro da lista
    if (state.players.length > 0) {
      state.settings.currentPlayerId = state.players[0].id;
    }
  }

  async setFirstPlayer(userId: string): Promise<Player | undefined> {
    const state = this.getUserState(userId);
    if (state.players.length === 0) return undefined;

    state.settings.currentPlayerId = state.players[0].id;
    return state.players[0];
  }

  async getPlayer(userId: string, id: string): Promise<Player | undefined> {
    const state = this.getUserState(userId);
    return state.players.find(p => p.id === id);
  }

  async getGameSettings(userId: string): Promise<GameSettings> {
    return this.getUserState(userId).settings;
  }

  async updateGameSettings(userId: string, maxPoints: number): Promise<GameSettings> {
    const state = this.getUserState(userId);
    state.settings.maxPoints = maxPoints;
    return state.settings;
  }
}

export const storage = new MemStorage();