import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import type { UserProfile, UserGameStats } from "@shared/schema";

const firebaseConfig = {
  apiKey: "AIzaSyBSbE-z6rYYOW7UkbzdWFWSdmEkLOnVe5U",
  authDomain: "gorf-o-jogo.firebaseapp.com",
  projectId: "gorf-o-jogo",
  storageBucket: "gorf-o-jogo.firebasestorage.app",
  messagingSenderId: "169710703950",
  appId: "1:169710703950:web:ebea65b3c93e180a10ba1f",
  measurementId: "G-YGF0WE1E38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Função para verificar se o usuário existe no Firestore
export async function checkUserProfile(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    console.log("Checking if user exists in Firestore:", userId);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const exists = userDoc.exists();
    console.log("User exists in Firestore:", exists);
    return exists;
  } catch (error) {
    console.error("Error checking user profile:", error);
    return false;
  }
}

// Função para criar o perfil do usuário no Firestore
export async function createUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
  if (!userId) {
    throw new Error("UserId is required to create profile");
  }

  try {
    console.log("Creating new user profile:", userId);
    const userRef = doc(db, 'users', userId);

    // Verificar se já existe
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      console.log("User already exists, returning existing profile");
      return userDoc.data() as UserProfile;
    }

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      id: userId,
      name: profile.name || auth.currentUser?.displayName || "Usuário",
      birthDate: profile.birthDate || now,
      gender: profile.gender || "homem",
      favoriteSocialNetwork: profile.favoriteSocialNetwork || "instagram",
      favoriteDrinks: profile.favoriteDrinks || [],
      createdAt: now,
      updatedAt: now,
    };

    // Criar o perfil
    await setDoc(userRef, newProfile);
    console.log("User profile created successfully");

    // Criar as estatísticas iniciais
    const statsRef = doc(db, 'users', userId, 'stats', 'gameStats');
    await setDoc(statsRef, {
      lastGamePlayed: null,
      totalGamesPlayed: 0,
      victories: 0,
      totalPlayTime: 0,
      lastGameStartTime: null,
      uniquePlayers: 0
    });
    console.log("Game stats initialized");

    // Criar a coleção de jogos recentes
    const recentGamesRef = doc(db, 'users', userId, 'games', 'recent');
    await setDoc(recentGamesRef, { games: [] });
    console.log("Recent games collection initialized");

    return newProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

// Função para obter o perfil do usuário
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;

  try {
    console.log("Getting user profile:", userId);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log("User profile not found");
      return null;
    }

    console.log("User profile retrieved successfully");
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

// Função para atualizar o perfil do usuário
export async function updateUserProfile(profile: UserProfile) {
  const userRef = doc(db, 'users', profile.id);
  await updateDoc(userRef, {
    ...profile,
    updatedAt: new Date().toISOString()
  });
}

// Funções para estatísticas do jogo
export async function getUserStats(userId: string): Promise<UserGameStats | null> {
  if (!userId) return null;

  try {
    const statsRef = doc(db, 'users', userId, 'stats', 'gameStats');
    const statsDoc = await getDoc(statsRef);
    return statsDoc.exists() ? statsDoc.data() as UserGameStats : null;
  } catch (error) {
    console.error("Error getting user stats:", error);
    return null;
  }
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
    lastGameStartTime: null,
    uniquePlayers: 0
  }, { merge: true });

  // Clear recent games
  await setDoc(recentGamesRef, {
    games: []
  }, { merge: true });
}

// Observar mudanças no estado de autenticação
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User signed in:", user.uid);
    localStorage.setItem('currentUserId', user.uid);

    // Verificar se o usuário já tem perfil
    const hasProfile = await checkUserProfile(user.uid);
    if (!hasProfile) {
      console.log("New user detected, needs onboarding");
      localStorage.setItem('needsOnboarding', 'true');
    } else {
      console.log("Existing user detected");
      localStorage.removeItem('needsOnboarding');
    }
  } else {
    console.log("User signed out");
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('needsOnboarding');
  }
});

export { app };