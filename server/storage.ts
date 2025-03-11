import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  increment,
  writeBatch,
  getFirestore
} from 'firebase/firestore';
import { initializeApp } from "firebase/app";

// Helper para acessar variáveis de ambiente
const getEnvVar = (key: string): string => {
  if (typeof window !== 'undefined' && import.meta?.env) {
    return import.meta.env[key] || '';
  }
  return process.env[key] || '';
};

// Configuração do Firebase
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: `${getEnvVar('VITE_FIREBASE_PROJECT_ID')}.firebaseapp.com`,
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: `${getEnvVar('VITE_FIREBASE_PROJECT_ID')}.appspot.com`,
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

import type { 
  Player, 
  InsertPlayer, 
  CustomGame, 
  InsertCustomGame, 
  GameSettings 
} from "@shared/schema";

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

  // Custom Games
  getCustomGames(): Promise<CustomGame[]>;
  addCustomGame(game: InsertCustomGame): Promise<CustomGame>;
  getCustomGame(id: string): Promise<CustomGame | undefined>;
  deleteCustomGame(id: string): Promise<void>;
}

export class FirestoreStorage implements IStorage {
  private readonly playersRef = collection(db, 'players');
  private readonly settingsRef = doc(db, 'settings', 'game');
  private readonly customGamesRef = collection(db, 'customGames');

  async getPlayers(): Promise<Player[]> {
    try {
      const snapshot = await getDocs(this.playersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error);
      throw error;
    }
  }

  async addPlayer(player: InsertPlayer): Promise<Player> {
    try {
      const docRef = doc(this.playersRef);
      const newPlayer: Player = {
        id: docRef.id,
        name: player.name,
        points: 0,
        isActive: true,
        challengesCompleted: 0,
        drinksCompleted: 0,
      };

      // Primeiro, verifica se já existe algum jogador
      const settingsDoc = await getDoc(this.settingsRef);
      const isFirstPlayer = !settingsDoc.exists();

      // Operações em batch para melhor performance
      const batch = writeBatch(db);

      // Adiciona o jogador
      batch.set(docRef, newPlayer);

      // Se for o primeiro jogador, inicializa as configurações
      if (isFirstPlayer) {
        batch.set(this.settingsRef, {
          maxPoints: 100,
          currentPlayerId: docRef.id
        });
      }

      // Executa todas as operações de uma vez
      await batch.commit();

      return newPlayer;
    } catch (error) {
      console.error('Erro ao adicionar jogador:', error);
      throw error;
    }
  }

  async updatePlayerPoints(id: string, points: number, type: "challenge" | "drink"): Promise<Player> {
    const playerRef = doc(this.playersRef, id);
    const playerDoc = await getDoc(playerRef);

    if (!playerDoc.exists()) {
      throw new Error("Player not found");
    }

    const updateData = {
      points: increment(points),
      challengesCompleted: type === "challenge" ? increment(1) : increment(0),
      drinksCompleted: type === "drink" ? increment(points) : increment(0),
    };

    await updateDoc(playerRef, updateData);

    const updatedDoc = await getDoc(playerRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Player;
  }

  async getCurrentPlayer(): Promise<Player | undefined> {
    const settings = await this.getGameSettings();
    if (!settings.currentPlayerId) return undefined;

    const playerDoc = await getDoc(doc(this.playersRef, settings.currentPlayerId));
    return playerDoc.exists() ? { id: playerDoc.id, ...playerDoc.data() } as Player : undefined;
  }

  async setNextPlayer(): Promise<Player | undefined> {
    const players = await this.getPlayers();
    if (players.length === 0) return undefined;

    const settings = await this.getGameSettings();
    const currentIndex = players.findIndex(p => p.id === settings.currentPlayerId);
    const nextIndex = (currentIndex + 1) % players.length;
    const nextPlayer = players[nextIndex];

    await updateDoc(this.settingsRef, { currentPlayerId: nextPlayer.id });
    return nextPlayer;
  }

  async removePlayer(id: string): Promise<void> {
    const playerRef = doc(this.playersRef, id);
    await deleteDoc(playerRef);

    // Se o jogador removido era o atual, passa para o próximo
    const settings = await this.getGameSettings();
    if (settings.currentPlayerId === id) {
      await this.setNextPlayer();
    }
  }

  async getGameSettings(): Promise<GameSettings> {
    const settingsDoc = await getDoc(this.settingsRef);
    if (!settingsDoc.exists()) {
      const defaultSettings: GameSettings = {
        maxPoints: 100,
        currentPlayerId: null,
      };
      await setDoc(this.settingsRef, defaultSettings);
      return defaultSettings;
    }
    return settingsDoc.data() as GameSettings;
  }

  async updateGameSettings(maxPoints: number): Promise<GameSettings> {
    await updateDoc(this.settingsRef, { maxPoints });
    const updatedDoc = await getDoc(this.settingsRef);
    return updatedDoc.data() as GameSettings;
  }

  async getCustomGames(): Promise<CustomGame[]> {
    const snapshot = await getDocs(this.customGamesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomGame));
  }

  async addCustomGame(game: InsertCustomGame): Promise<CustomGame> {
    const docRef = doc(this.customGamesRef);
    const newGame: CustomGame = {
      id: docRef.id,
      ...game,
    };
    await setDoc(docRef, newGame);
    return newGame;
  }

  async getCustomGame(id: string): Promise<CustomGame | undefined> {
    const gameDoc = await getDoc(doc(this.customGamesRef, id));
    return gameDoc.exists() ? { id: gameDoc.id, ...gameDoc.data() } as CustomGame : undefined;
  }

  async deleteCustomGame(id: string): Promise<void> {
    await deleteDoc(doc(this.customGamesRef, id));
  }

  async removeAllPlayers(): Promise<void> {
    const snapshot = await getDocs(this.playersRef);
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    await updateDoc(this.settingsRef, { currentPlayerId: null });
  }

  async resetPlayersPoints(): Promise<void> {
    const snapshot = await getDocs(this.playersRef);
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        points: 0,
        challengesCompleted: 0,
        drinksCompleted: 0
      });
    });

    await batch.commit();

    // Resetar o jogador atual para o primeiro da lista
    const players = await this.getPlayers();
    if (players.length > 0) {
      await updateDoc(this.settingsRef, { currentPlayerId: players[0].id });
    }
  }

  async setFirstPlayer(): Promise<Player | undefined> {
    const players = await this.getPlayers();
    if (players.length === 0) return undefined;

    await updateDoc(this.settingsRef, { currentPlayerId: players[0].id });
    return players[0];
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const playerDoc = await getDoc(doc(this.playersRef, id));
    return playerDoc.exists() ? { id: playerDoc.id, ...playerDoc.data() } as Player : undefined;
  }
}

export const storage = new FirestoreStorage();