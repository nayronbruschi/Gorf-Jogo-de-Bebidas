import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
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

// Verificar se usuário existe no Firestore
export async function checkUserProfile(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    console.log("[Firebase] Verificando usuário:", userId);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const exists = userDoc.exists();
    console.log("[Firebase] Usuário existe:", exists);
    return exists;
  } catch (error) {
    console.error("[Firebase] Erro ao verificar usuário:", error);
    return false;
  }
}

// Criar perfil do usuário
export async function createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
  if (!userId) {
    throw new Error("UserId é obrigatório");
  }

  try {
    console.log("[Firebase] Criando perfil para:", userId);
    const userRef = doc(db, 'users', userId);

    // Verificar se já existe
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      console.log("[Firebase] Perfil já existe");
      return userDoc.data() as UserProfile;
    }

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      id: userId,
      name: profileData.name || auth.currentUser?.displayName || "",
      birthDate: profileData.birthDate || now,
      gender: profileData.gender || "homem",
      favoriteSocialNetwork: profileData.favoriteSocialNetwork || "instagram",
      favoriteDrinks: profileData.favoriteDrinks || [],
      createdAt: now,
      updatedAt: now
    };

    // Criar perfil principal
    await setDoc(userRef, newProfile);
    console.log("[Firebase] Perfil criado");

    // Criar stats
    const statsRef = doc(db, 'users', userId, 'stats', 'gameStats');
    await setDoc(statsRef, {
      lastGamePlayed: null,
      totalGamesPlayed: 0,
      victories: 0,
      totalPlayTime: 0,
      lastGameStartTime: null,
      uniquePlayers: 0
    });
    console.log("[Firebase] Stats inicializados");

    // Criar jogos recentes
    const recentGamesRef = doc(db, 'users', userId, 'games', 'recent');
    await setDoc(recentGamesRef, { games: [] });
    console.log("[Firebase] Jogos recentes inicializados");

    return newProfile;
  } catch (error) {
    console.error("[Firebase] Erro ao criar perfil:", error);
    throw error;
  }
}

// Obter perfil do usuário
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;

  try {
    console.log("[Firebase] Obtendo perfil para:", userId);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log("[Firebase] Perfil não encontrado");
      return null;
    }

    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error("[Firebase] Erro ao obter perfil:", error);
    return null;
  }
}

// Observer de autenticação
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("[Firebase] Usuário logado:", user.uid);

    // Verificar se usuário tem perfil
    const hasProfile = await checkUserProfile(user.uid);

    if (!hasProfile) {
      console.log("[Firebase] Novo usuário, precisa de onboarding");
      localStorage.setItem('needsOnboarding', 'true');
    } else {
      console.log("[Firebase] Usuário existente");
      localStorage.removeItem('needsOnboarding');
    }
  } else {
    console.log("[Firebase] Usuário deslogado");
    localStorage.removeItem('needsOnboarding');
  }
});

export { app };