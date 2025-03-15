import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, collection, getDocs, increment } from "firebase/firestore";
import type { UserProfile, UserGameStats } from "@shared/schema";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Função para criar usuário com retry
export async function createUserProfile(userId: string, profile: Partial<UserProfile> = {}, retryCount = 3): Promise<UserProfile> {
  console.log(`Attempting to create user profile for ${userId}, attempt ${4 - retryCount}`);

  if (!userId) {
    throw new Error("UserId is required to create profile");
  }

  try {
    // 1. Verificar se usuário já existe
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      console.log("User profile already exists, returning existing data");
      return userDoc.data() as UserProfile;
    }

    // 2. Criar novo perfil
    console.log("Creating new user profile");
    const now = new Date().toISOString();

    const defaultProfile: UserProfile = {
      id: userId,
      name: profile.name || auth.currentUser?.displayName || "Usuário",
      birthDate: profile.birthDate || now,
      gender: profile.gender || "homem",
      favoriteSocialNetwork: profile.favoriteSocialNetwork || "instagram",
      favoriteDrinks: profile.favoriteDrinks || [],
      createdAt: now,
      updatedAt: now,
    };

    // 3. Criar todos os documentos necessários
    await setDoc(userRef, defaultProfile);
    console.log("Basic profile created");

    // 4. Criar estatísticas
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

    // 5. Criar jogos recentes
    const recentGamesRef = doc(db, 'users', userId, 'games', 'recent');
    await setDoc(recentGamesRef, { games: [] });
    console.log("Recent games collection initialized");

    // 6. Verificar se tudo foi criado corretamente
    const verifyDoc = await getDoc(userRef);
    if (!verifyDoc.exists()) {
      throw new Error("Profile verification failed");
    }

    console.log("User profile creation successful");
    return defaultProfile;

  } catch (error) {
    console.error("Error in createUserProfile:", error);

    // Retry logic
    if (retryCount > 0) {
      console.log(`Retrying... ${retryCount} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return createUserProfile(userId, profile, retryCount - 1);
    }

    throw new Error(`Failed to create user profile after all attempts: ${error}`);
  }
}

// Função para verificar se usuário existe
export async function checkUserProfile(userId: string): Promise<boolean> {
  try {
    console.log(`Checking profile existence for user ${userId}`);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const exists = userDoc.exists();
    console.log(`Profile exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error("Error checking user profile:", error);
    return false;
  }
}

// Função para obter perfil do usuário
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log(`Fetching profile for user ${userId}`);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log("Profile not found");
      return null;
    }

    console.log("Profile retrieved successfully");
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function updateUserProfile(profile: UserProfile) {
  const userRef = doc(db, 'users', profile.id);
  await updateDoc(userRef, {
    ...profile,
    updatedAt: new Date().toISOString()
  });
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
    lastGameStartTime: null,
    uniquePlayers: 0
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
  } else {
    localStorage.removeItem('currentUserId');
  }
});

export { app };