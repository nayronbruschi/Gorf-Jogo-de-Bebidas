import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import type { UserProfile, InsertUserProfile, UserGameStats } from "@shared/schema";

const firebaseConfig = {
  apiKey: "AIzaSyDRZ0akGNllg2YFaJM832PWSXvbNfcFbcE",
  authDomain: "gorf-jogo-de-bebidas.firebaseapp.com",
  projectId: "gorf-jogo-de-bebidas",
  storageBucket: "gorf-jogo-de-bebidas.firebasestorage.app",
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
      return userSnap.data() as UserProfile;
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

    // Atualizar estatísticas
    await updateDoc(userRef, {
      'gameStats.lastGamePlayed': gameName,
      'gameStats.totalGamesPlayed': (userData.gameStats?.totalGamesPlayed || 0) + 1,
      'gameStats.lastGameStartTime': now,
      'gameStats.recentGames': arrayUnion({
        name: gameName,
        playedAt: now
      })
    });

  } catch (error) {
    console.error("[Firebase] Error updating game stats:", error);
    throw error;
  }
}

export { app, auth, googleProvider, db };