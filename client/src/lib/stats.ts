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