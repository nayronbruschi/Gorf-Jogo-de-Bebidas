import { getFirestore, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { app } from '@/lib/firebase';

// Inicializa o Firestore
const db = getFirestore(app);

// Hook para rastrear o tempo de jogo
export function useGameTimer() {
  const startTime = Date.now();

  return () => {
    const endTime = Date.now();
    const playTimeInSeconds = Math.floor((endTime - startTime) / 1000);
    return playTimeInSeconds;
  };
}