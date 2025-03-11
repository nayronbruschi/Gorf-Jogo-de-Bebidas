import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { app } from '@/lib/firebase';

// Inicializa o Firestore
const db = getFirestore(app);

export interface GameStats {
  gamesPlayed: number;
  timeSpent: number; // em minutos
  lastPlayed: string;
}

export interface UserStats {
  totalGamesPlayed: number;
  uniquePlayers: number;
  totalPlayTime: number; // em minutos
  gameStats: {
    classic: GameStats;
    roulette: GameStats;
    guessWho: GameStats;
    touchGame: GameStats;
    spinBottle: GameStats;
    coinFlip: GameStats;
    cards: GameStats;
  };
}

const DEFAULT_GAME_STATS: GameStats = {
  gamesPlayed: 0,
  timeSpent: 0,
  lastPlayed: new Date().toISOString()
};

const DEFAULT_STATS: UserStats = {
  totalGamesPlayed: 0,
  uniquePlayers: 0,
  totalPlayTime: 0,
  gameStats: {
    classic: { ...DEFAULT_GAME_STATS },
    roulette: { ...DEFAULT_GAME_STATS },
    guessWho: { ...DEFAULT_GAME_STATS },
    touchGame: { ...DEFAULT_GAME_STATS },
    spinBottle: { ...DEFAULT_GAME_STATS },
    coinFlip: { ...DEFAULT_GAME_STATS },
    cards: { ...DEFAULT_GAME_STATS }
  }
};

export async function getUserStats(): Promise<UserStats> {
  const userId = auth.currentUser?.uid;
  if (!userId) return DEFAULT_STATS;

  try {
    const userStatsRef = doc(db, 'users', userId, 'stats', 'games');
    const statsDoc = await getDoc(userStatsRef);

    if (!statsDoc.exists()) {
      // Se não existir, cria com valores padrão
      await setDoc(userStatsRef, DEFAULT_STATS);
      return DEFAULT_STATS;
    }

    return statsDoc.data() as UserStats;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return DEFAULT_STATS;
  }
}

export type GameType = keyof UserStats['gameStats'];

interface GameUpdateData {
  gameType: GameType;
  playTime: number; // em minutos
  playerCount: number;
}

export async function updateGameStats(data: GameUpdateData) {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  try {
    const userStatsRef = doc(db, 'users', userId, 'stats', 'games');

    // Atualiza estatísticas específicas do jogo
    await updateDoc(userStatsRef, {
      [`gameStats.${data.gameType}.gamesPlayed`]: increment(1),
      [`gameStats.${data.gameType}.timeSpent`]: increment(data.playTime),
      [`gameStats.${data.gameType}.lastPlayed`]: new Date().toISOString(),

      // Atualiza estatísticas gerais
      totalGamesPlayed: increment(1),
      totalPlayTime: increment(data.playTime),
      uniquePlayers: increment(data.playerCount)
    });
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
  }
}

// Hook para rastrear o tempo de jogo
export function useGameTimer() {
  const startTime = new Date().getTime();

  return () => {
    const endTime = new Date().getTime();
    const playTimeInMinutes = Math.floor((endTime - startTime) / (1000 * 60));
    return playTimeInMinutes;
  };
}