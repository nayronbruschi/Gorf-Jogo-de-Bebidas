import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

export interface UserStats {
  gamesPlayed: number;
  victories: number;
  uniquePlayers: number;
  totalPlayTime: number; // em minutos
}

const DEFAULT_STATS: UserStats = {
  gamesPlayed: 0,
  victories: 0,
  uniquePlayers: 0,
  totalPlayTime: 0
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

export async function updateGameStats(update: Partial<UserStats>) {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  try {
    const userStatsRef = doc(db, 'users', userId, 'stats', 'games');
    await updateDoc(userStatsRef, {
      ...Object.entries(update).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: increment(value)
      }), {})
    });
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
  }
}
