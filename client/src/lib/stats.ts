import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { app } from '@/lib/firebase';

// Inicializa o Firestore
const db = getFirestore(app);

export interface GameStats {
  gamesPlayed: number;
  timeSpent: string; // formato "HH:MM:SS"
  lastPlayed: string;
}

export interface UserStats {
  totalGamesPlayed: number;
  uniquePlayers: number;
  totalPlayTime: string; // formato "HH:MM:SS"
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

// Função para formatar tempo em HH:MM:SS
function formatTime(timeInSeconds: number): string {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Função para converter string HH:MM:SS para segundos
function timeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
}

// Função para adicionar tempos em formato HH:MM:SS
function addTimes(time1: string, time2: string): string {
  const totalSeconds = timeToSeconds(time1) + timeToSeconds(time2);
  return formatTime(totalSeconds);
}

const DEFAULT_GAME_STATS: GameStats = {
  gamesPlayed: 0,
  timeSpent: "00:00:00",
  lastPlayed: new Date().toISOString()
};

const DEFAULT_STATS: UserStats = {
  totalGamesPlayed: 0,
  uniquePlayers: 0,
  totalPlayTime: "00:00:00",
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
  playTimeInSeconds: number;
  playerNames: string[]; // Array of unique player names
}

export async function updateGameStats(data: GameUpdateData) {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  try {
    const userStatsRef = doc(db, 'users', userId, 'stats', 'games');
    const currentStats = await getDoc(userStatsRef);
    const stats = currentStats.exists() ? currentStats.data() as UserStats : DEFAULT_STATS;

    // Format new play time
    const newPlayTime = formatTime(data.playTimeInSeconds);

    // Get unique players count
    const uniquePlayerCount = new Set(data.playerNames).size;

    // Update game specific stats
    const gameTimeSpent = stats.gameStats[data.gameType].timeSpent || "00:00:00";
    const updatedGameTime = addTimes(gameTimeSpent, newPlayTime);

    // Update total play time
    const totalPlayTime = stats.totalPlayTime || "00:00:00";
    const updatedTotalTime = addTimes(totalPlayTime, newPlayTime);

    await updateDoc(userStatsRef, {
      [`gameStats.${data.gameType}.gamesPlayed`]: increment(1),
      [`gameStats.${data.gameType}.timeSpent`]: updatedGameTime,
      [`gameStats.${data.gameType}.lastPlayed`]: new Date().toISOString(),

      // Update general stats
      totalGamesPlayed: increment(1),
      totalPlayTime: updatedTotalTime,
      uniquePlayers: increment(uniquePlayerCount)
    });
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
  }
}

// Hook para rastrear o tempo de jogo
export function useGameTimer() {
  const startTime = Date.now();

  return () => {
    const endTime = Date.now();
    const playTimeInSeconds = Math.floor((endTime - startTime) / 1000);
    return playTimeInSeconds;
  };
}