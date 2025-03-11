import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

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

// Log para debug da configuração
console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configurações adicionais para o provedor Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Observar mudanças no estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem('currentUserId', user.uid);
  } else {
    localStorage.removeItem('currentUserId');
  }
});

console.log('Firebase initialized successfully');

// Exporta o app para uso em outros módulos
export { app };