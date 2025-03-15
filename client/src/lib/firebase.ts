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
  authDomain: "gorf.com.br",
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
  prompt: 'select_account',
  // Forçar o uso do domínio gorf.com.br
  hd: 'gorf.com.br'
});

// Add state parameter to track auth source
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  state: 'fromAuth'
});

// Funções auxiliares para gerenciar dados do usuário
export async function createUserProfile(userId: string, profile: Partial<UserProfile> = {}) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const now = new Date().toISOString();
    // Create default profile
    const defaultProfile: UserProfile = {
      id: userId,
      name: profile.name || auth.currentUser?.displayName || "Usuário",
      birthDate: profile.birthDate || now,
      gender: profile.gender || "homem",
      favoriteSocialNetwork: profile.favoriteSocialNetwork || "instagram",
      createdAt: now,
      updatedAt: now,
    };

    // Criar perfil do usuário
    await setDoc(userRef, defaultProfile);

    // Criar subcoleção de estatísticas
    const statsRef = doc(userRef, 'stats', 'gameStats');
    await setDoc(statsRef, {
      lastGamePlayed: null,
      totalGamesPlayed: 0,
      victories: 0,
      totalPlayTime: 0,
      lastGameStartTime: null
    });

    // Criar subcoleção de jogos recentes
    const recentGamesRef = doc(userRef, 'games', 'recent');
    await setDoc(recentGamesRef, {
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
  const statsRef = doc(db, 'users', userId, 'stats', 'gameStats');
  const statsDoc = await getDoc(statsRef);
  return statsDoc.exists() ? statsDoc.data() as UserGameStats : null;
}

export async function getRecentGames(userId: string) {
  const recentGamesRef = doc(db, 'users', userId, 'games', 'recent');
  const recentGamesDoc = await getDoc(recentGamesRef);
  return recentGamesDoc.exists() ? recentGamesDoc.data().games.slice(0, 3) : [];
}

// Funções para gerenciar o tempo de jogo
export async function startGameSession(userId: string) {
  const statsRef = doc(db, 'users', userId, 'stats', 'gameStats');
  const now = new Date().toISOString();

  await updateDoc(statsRef, {
    lastGameStartTime: now,
    totalGamesPlayed: increment(1)
  });
}

export async function endGameSession(userId: string) {
  const statsRef = doc(db, 'users', userId, 'stats', 'gameStats');
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
  const recentGamesRef = doc(db, 'users', userId, 'games', 'recent');
  const recentGamesDoc = await getDoc(recentGamesRef);

  if (recentGamesDoc.exists()) {
    const currentGames = recentGamesDoc.data().games || [];

    // Verificar duplicidade nos últimos 5 segundos
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    const isDuplicate = currentGames.some((game: any) =>
      game.date > fiveSecondsAgo &&
      game.name === gameData.name &&
      game.winner === gameData.winner
    );

    if (!isDuplicate) {
      const newGames = [gameData, ...currentGames.slice(0, 2)]; // Manter apenas os 3 últimos jogos
      await updateDoc(recentGamesRef, { games: newGames });

      // Atualizar último jogo jogado nas estatísticas apenas se for um novo jogo
      if (isNewGame) {
        const statsRef = doc(db, 'users', userId, 'stats', 'gameStats');
        await updateDoc(statsRef, {
          lastGamePlayed: gameData.date
        });
      }
    }
  }
}

// Limpar dados de jogos de um usuário específico
export async function clearUserGameData(userId: string) {
  const statsRef = doc(db, 'users', userId, 'stats', 'gameStats');
  const recentGamesRef = doc(db, 'users', userId, 'games', 'recent');

  // Reset user stats
  await setDoc(statsRef, {
    lastGamePlayed: null,
    totalGamesPlayed: 0,
    victories: 0,
    totalPlayTime: 0,
    lastGameStartTime: null
  }, { merge: true });

  // Clear recent games
  await setDoc(recentGamesRef, {
    games: []
  }, { merge: true });
}

// Observar mudanças no estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem('currentUserId', user.uid);

    // Verificar se está voltando da autenticação do Google
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');

    if (state === 'fromAuth') {
      // Remover parâmetros da URL e redirecionar para dashboard
      window.history.replaceState({}, '', '/dashboard');
    } else if (window.location.pathname === '/') {
      // Se estiver na raiz e já autenticado, redirecionar para dashboard
      window.location.href = '/dashboard';
    }
  } else {
    localStorage.removeItem('currentUserId');
    // Se não estiver autenticado e não estiver na página de autenticação ou splash,
    // redirecionar para a raiz
    if (!['/auth', '/'].includes(window.location.pathname)) {
      window.location.href = '/';
    }
  }
});

export { app };