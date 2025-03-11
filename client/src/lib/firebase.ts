import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
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

// Enable persistent login
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Configurações adicionais para o provedor Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Funções auxiliares para gerenciar dados do usuário
export async function createUserProfile(userId: string, profile: Partial<UserProfile>) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const now = new Date().toISOString();
    await setDoc(userRef, {
      ...profile,
      id: userId,
      createdAt: now,
      updatedAt: now,
    });

    // Inicializar estatísticas do jogador
    const statsRef = doc(db, 'userStats', userId);
    await setDoc(statsRef, {
      userId,
      lastGamePlayed: null,
      totalGamesPlayed: 0,
      uniquePlayers: 0,
      totalPlayTime: 0,
    });

    // Inicializar jogos recentes
    const recentGamesRef = doc(db, 'recentGames', userId);
    await setDoc(recentGamesRef, {
      userId,
      games: []
    });
  }
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

export async function updateRecentGames(userId: string, gameData: {
  name: string;
  date: string;
  players: number;
  winner: string;
}) {
  const recentGamesRef = doc(db, 'recentGames', userId);
  const recentGamesDoc = await getDoc(recentGamesRef);

  if (recentGamesDoc.exists()) {
    const currentGames = recentGamesDoc.data().games || [];
    const newGames = [gameData, ...currentGames.slice(0, 2)]; // Keep only last 3 games
    await updateDoc(recentGamesRef, { games: newGames });
  }

  // Update last game played in stats
  const statsRef = doc(db, 'userStats', userId);
  await updateDoc(statsRef, {
    lastGamePlayed: gameData.date
  });
}

// Observar mudanças no estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem('currentUserId', user.uid);
  } else {
    localStorage.removeItem('currentUserId');
  }
});

console.log('Firebase initialized successfully');

export { app };