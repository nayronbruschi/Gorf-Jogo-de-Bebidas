import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import type { UserProfile, InsertUserProfile, UserGameStats } from "@shared/schema";

const firebaseConfig = {
  apiKey: "AIzaSyDRZ0akGNllg2YFaJM832PWSXvbNfcFbcE",
  authDomain: "gorf-jogo-de-bebidas.firebaseapp.com",
  projectId: "gorf-jogo-de-bebidas",
  storageBucket: "gorf-jogo-de-bebidas.appspot.com",
  messagingSenderId: "666516951655",
  appId: "1:666516951655:web:ecade148dce7e08852fac2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Função para verificar se o usuário já tem perfil
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      // Garantir que os jogos recentes estejam ordenados por data
      if (userData.gameStats?.recentGames) {
        userData.gameStats.recentGames = userData.gameStats.recentGames.sort((a, b) => 
          new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
        );
      }
      return userData;
    }

    return null;
  } catch (error) {
    console.error("[Firebase] Error getting user profile:", error);
    return null;
  }
}

// Função para criar perfil do usuário
export async function createUserProfile(
  userId: string, 
  profileData: InsertUserProfile
): Promise<UserProfile> {
  try {
    const now = new Date().toISOString();
    const userProfile: UserProfile = {
      id: userId,
      ...profileData,
      createdAt: now,
      updatedAt: now,
      gameStats: {
        userId: userId,
        lastGamePlayed: null,
        totalGamesPlayed: 0,
        victories: 0,
        totalPlayTime: 0,
        lastGameStartTime: null,
        recentGames: [] // Array dos últimos jogos jogados
      }
    };

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, userProfile);

    return userProfile;
  } catch (error) {
    console.error("[Firebase] Error creating user profile:", error);
    throw error;
  }
}

// Função para iniciar uma sessão de jogo
export async function startGameSession(userId: string, gameName: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const now = new Date().toISOString();

    await updateDoc(userRef, {
      'gameStats.lastGameStartTime': now,
      'gameStats.lastGamePlayed': gameName
    });

  } catch (error) {
    console.error("[Firebase] Error starting game session:", error);
    throw error;
  }
}

// Função para finalizar uma sessão de jogo e atualizar o tempo total
export async function endGameSession(userId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const userData = userSnap.data();
    const startTime = userData.gameStats?.lastGameStartTime;

    if (startTime) {
      const playedMinutes = Math.floor(
        (new Date().getTime() - new Date(startTime).getTime()) / (1000 * 60)
      );

      await updateDoc(userRef, {
        'gameStats.totalPlayTime': (userData.gameStats?.totalPlayTime || 0) + playedMinutes,
        'gameStats.lastGameStartTime': null
      });
    }

  } catch (error) {
    console.error("[Firebase] Error ending game session:", error);
    throw error;
  }
}

// Função para atualizar as estatísticas de jogo
export async function updateGameStats(userId: string, gameName: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const userData = userSnap.data();
    const now = new Date().toISOString();

    // Criar novo jogo para adicionar à lista
    const newGame = {
      name: gameName,
      playedAt: now
    };

    // Pegar lista atual de jogos recentes ordenada por data
    let currentGames = userData.gameStats?.recentGames || [];
    currentGames = currentGames.sort((a, b) => 
      new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
    );

    // Criar nova lista inserindo o novo jogo no início
    // e manter apenas os últimos 10 jogos
    const updatedGames = [newGame, ...currentGames].slice(0, 10);

    // Atualizar estatísticas
    await updateDoc(userRef, {
      'gameStats.lastGamePlayed': gameName,
      'gameStats.totalGamesPlayed': (userData.gameStats?.totalGamesPlayed || 0) + 1,
      'gameStats.lastGameStartTime': now,
      'gameStats.recentGames': updatedGames
    });

  } catch (error) {
    console.error("[Firebase] Error updating game stats:", error);
    throw error;
  }
}

export { app, auth, googleProvider, db };