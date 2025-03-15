import { useState, useEffect } from 'react';

// Hook para rastrear o tempo de jogo
export function useGameTimer() {
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return elapsedTime;
}

// Stub function to prevent import errors
export async function updateGameStats(data: any): Promise<void> {
  console.log("[Stats] Statistics temporarily disabled. Called with data:", data);
}

// Stub function for getUserStats
export async function getUserStats(): Promise<any> {
  console.log("[Stats] getUserStats temporarily disabled");
  return {
    gamesPlayed: 0,
    totalPlayTime: 0,
    favoriteGame: 'classic',
    achievements: []
  };
}

// Stub function for updateRecentGames
export async function updateRecentGames(userId: string, gameData: any): Promise<void> {
  console.log("[Stats] updateRecentGames temporarily disabled. Called with:", { userId, gameData });
}