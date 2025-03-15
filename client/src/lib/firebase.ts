import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, googleProvider };

// Stub function to prevent import errors
export async function createUserProfile(userId: string, profileData: any): Promise<any> {
  console.log("[Firebase] createUserProfile stub called with", { userId, profileData });
  return { id: userId, ...profileData };
}