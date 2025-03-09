import { useCallback } from "react";

type SoundEffect = "click" | "success" | "error" | "tada";

const soundUrls: Record<SoundEffect, string> = {
  click: "https://assets.mixkit.co/sfx/preview/mixkit-simple-click-1120.mp3",
  success: "https://assets.mixkit.co/sfx/preview/mixkit-winning-notification-2018.mp3",
  error: "https://assets.mixkit.co/sfx/preview/mixkit-error-warning-alert-2967.mp3",
  tada: "https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3",
};

export function useSound() {
  const play = useCallback((effect: SoundEffect) => {
    const audio = new Audio(soundUrls[effect]);
    audio.play().catch(() => {
      // Ignore errors from browsers that block autoplay
    });
  }, []);

  return { play };
}
