import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

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
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Observer de autenticação básico
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("[Firebase] Usuário logado:", user.uid);
    localStorage.removeItem('needsOnboarding');
  } else {
    console.log("[Firebase] Usuário deslogado");
    localStorage.removeItem('needsOnboarding');
  }
});

export { app };