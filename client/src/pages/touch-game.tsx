import { useState, useEffect, useRef } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion, AnimatePresence } from "framer-motion";

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  color: string;
}

// Array de cores vibrantes para os círculos
const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD",
  "#D4A5A5", "#9B59B6", "#3498DB", "#E67E22", "#2ECC71",
  "#E74C3C", "#1ABC9C", "#F1C40F", "#9B59B6", "#34495E"
];

export default function TouchGame() {
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<TouchPoint | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchPointsRef = useRef<TouchPoint[]>([]);

  const handleTouch = (e: TouchEvent) => {
    e.preventDefault();
    if (selecting) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newPoints: TouchPoint[] = [];
    for (let i = 0; i < e.touches.length && i < 15; i++) {
      const touch = e.touches[i];
      newPoints.push({
        id: i,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        color: colors[i]
      });
    }
    setTouchPoints(newPoints);
    touchPointsRef.current = newPoints;

    // Reset timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Start new timer if there are points
    if (newPoints.length > 0) {
      timerRef.current = setTimeout(() => {
        selectRandom();
      }, 3000);
    }
  };

  const selectRandom = () => {
    if (touchPointsRef.current.length === 0 || selecting) return;

    setSelecting(true);
    const duration = 2000; // 2 segundos
    const interval = 100; // 0.1 segundo por ponto
    let timeElapsed = 0;

    const flash = setInterval(() => {
      timeElapsed += interval;

      if (timeElapsed >= duration) {
        clearInterval(flash);
        const randomPoint = touchPointsRef.current[Math.floor(Math.random() * touchPointsRef.current.length)];
        setSelectedPoint(randomPoint);
        setSelecting(false);
      } else {
        setSelectedPoint(touchPointsRef.current[Math.floor(Math.random() * touchPointsRef.current.length)]);
      }
    }, interval);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouch);
    container.addEventListener('touchmove', handleTouch);
    container.addEventListener('touchend', handleTouch);

    return () => {
      container.removeEventListener('touchstart', handleTouch);
      container.removeEventListener('touchmove', handleTouch);
      container.removeEventListener('touchend', handleTouch);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [selecting]);

  return (
    <GameLayout title="Toque na Sorte">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center mb-4">
          <p className="text-white/80">
            Toque na tela com até 15 dedos e aguarde 3 segundos para o sorteio começar!
          </p>
        </div>

        <div
          ref={containerRef}
          className="w-full aspect-[3/4] bg-white/10 backdrop-blur-sm rounded-xl relative touch-none"
        >
          <AnimatePresence>
            {touchPoints.map((point) => (
              <motion.div
                key={point.id}
                initial={{ scale: 0 }}
                animate={{
                  scale: selectedPoint?.id === point.id ? [1, 1.2, 1] : 1,
                  backgroundColor: selectedPoint?.id === point.id 
                    ? "rgba(255, 255, 255, 0.9)" 
                    : point.color
                }}
                exit={{ scale: 0 }}
                transition={{
                  scale: {
                    duration: 0.3,
                    repeat: selectedPoint?.id === point.id ? Infinity : 0
                  }
                }}
                style={{
                  position: "absolute",
                  left: point.x - 40,
                  top: point.y - 40,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  opacity: 0.8,
                  border: "3px solid rgba(255, 255, 255, 0.8)"
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </GameLayout>
  );
}