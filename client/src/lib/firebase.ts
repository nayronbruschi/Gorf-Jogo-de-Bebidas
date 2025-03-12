import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, collection, getDocs, increment } from "firebase/firestore";
import type { UserProfile, UserGameStats } from "@shared/schema";

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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configurações adicionais para o provedor Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Funções auxiliares para gerenciar dados do usuário
export async function createUserProfile(userId: string, profile: Partial<UserProfile> = {}) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const now = new Date().toISOString();
    // Criar perfil apenas com dados essenciais
    const defaultProfile: UserProfile = {
      id: userId,
      name: profile.name || auth.currentUser?.displayName || "Usuário",
      birthDate: "", // Deixar vazio para o usuário preencher
      gender: "", // Deixar vazio para o usuário preencher
      favoriteSocialNetwork: "", // Deixar vazio para o usuário preencher
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, defaultProfile);

    // Inicializar estatísticas do jogador
    const statsRef = doc(db, 'userStats', userId);
    await setDoc(statsRef, {
      userId,
      lastGamePlayed: null,
      totalGamesPlayed: 0,
      victories: 0,
      totalPlayTime: 0,
      lastGameStartTime: null,
      uniquePlayers: 0
    });

    // Inicializar jogos recentes
    const recentGamesRef = doc(db, 'recentGames', userId);
    await setDoc(recentGamesRef, {
      userId,
      games: []
    });

    return defaultProfile;
  }

  return userDoc.data() as UserProfile;
}

export async function updateUserProfile(profile: UserProfile) {
  const userRef = doc(db, 'users', profile.id);
  await updateDoc(userRef, {
    ...profile,
    updatedAt: new Date().toISOString()
  });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data() as UserProfile : null;
}

export async function getUserStats(userId: string): Promise<UserGameStats | null> {
  const statsRef = doc(db, 'userStats', userId);
  const statsDoc = await getDoc(statsRef);
  return statsDoc.exists() ? statsDoc.data() as UserGameStats : null;
}

export async function getRecentGames(userId: string) {
  const recentGamesRef = doc(db, 'recentGames', userId);
  const recentGamesDoc = await getDoc(recentGamesRef);
  return recentGamesDoc.exists() ? recentGamesDoc.data().games.slice(0, 3) : [];
}

// Funções para gerenciar o tempo de jogo
export async function startGameSession(userId: string) {
  const statsRef = doc(db, 'userStats', userId);
  const now = new Date().toISOString();

  await updateDoc(statsRef, {
    lastGameStartTime: now,
    totalGamesPlayed: increment(1)
  });
}

export async function endGameSession(userId: string) {
  const statsRef = doc(db, 'userStats', userId);
  const statsDoc = await getDoc(statsRef);
  const stats = statsDoc.data();

  if (stats?.lastGameStartTime) {
    const startTime = new Date(stats.lastGameStartTime);
    const endTime = new Date();
    const playTimeInMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    await updateDoc(statsRef, {
      lastGameStartTime: null,
      totalPlayTime: increment(playTimeInMinutes)
    });
  }
}

export async function updateRecentGames(userId: string, gameData: {
  name: string;
  date: string;
  players: number;
  winner: string;
}, isNewGame: boolean = true) {
  const recentGamesRef = doc(db, 'recentGames', userId);
  const recentGamesDoc = await getDoc(recentGamesRef);

  if (recentGamesDoc.exists()) {
    const currentGames = recentGamesDoc.data().games || [];

    // Verificar duplicidade nos últimos 5 segundos
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    const isDuplicate = currentGames.some(game =>
      game.date > fiveSecondsAgo &&
      game.name === gameData.name &&
      game.winner === gameData.winner
    );

    if (!isDuplicate) {
      const newGames = [gameData, ...currentGames.slice(0, 2)]; // Manter apenas os 3 últimos jogos
      await updateDoc(recentGamesRef, { games: newGames });

      // Atualizar último jogo jogado nas estatísticas apenas se for um novo jogo
      if (isNewGame) {
        const statsRef = doc(db, 'userStats', userId);
        await updateDoc(statsRef, {
          lastGamePlayed: gameData.date
        });
      }
    }
  }
}

// Limpar dados de jogos de todos os usuários
export async function clearAllUsersGameData() {
  const usersRef = collection(db, 'users');
  const usersSnapshot = await getDocs(usersRef);

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;

    // Reset user stats
    const statsRef = doc(db, 'userStats', userId);
    await setDoc(statsRef, {
      userId,
      lastGamePlayed: null,
      totalGamesPlayed: 0,
      victories: 0,
      totalPlayTime: 0,
      lastGameStartTime: null,
      uniquePlayers: 0 //Adding missing field
    }, { merge: true });

    // Clear recent games
    const recentGamesRef = doc(db, 'recentGames', userId);
    await setDoc(recentGamesRef, {
      userId,
      games: []
    }, { merge: true });
  }
}

// Observar mudanças no estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem('currentUserId', user.uid);
  } else {
    localStorage.removeItem('currentUserId');
  }
});

export { app };