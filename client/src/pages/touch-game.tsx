import { useState, useEffect, useRef } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchPointsRef = useRef<TouchPoint[]>([]);

  const handleTouch = (e: TouchEvent) => {
    e.preventDefault();

    if (gameEnded) return;

    // Se não houver toques
    if (e.touches.length === 0) {
      setTouchPoints([]);
      touchPointsRef.current = [];
      return;
    }

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

    // Atualizar pontos apenas se não estivermos em contagem regressiva
    if (countdown === null) {
      setTouchPoints(newPoints);
      touchPointsRef.current = newPoints;

      // Iniciar contagem apenas se não estiver já contando
      if (timerRef.current === null) {
        setCountdown(3);

        const updateCountdown = () => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              selectRandom();
              return null;
            }
            return prev - 1;
          });
        };

        // Contagem regressiva mais lenta
        setTimeout(updateCountdown, 1500);
        setTimeout(updateCountdown, 3000);
        timerRef.current = setTimeout(() => {
          updateCountdown();
        }, 4500);
      }
    }
  };

  const selectRandom = () => {
    if (touchPointsRef.current.length === 0) return;

    setSelecting(true);
    const duration = 2000; // 2 segundos de animação
    const interval = 150; // Intervalo entre as piscadas
    let timeElapsed = 0;

    const flash = setInterval(() => {
      timeElapsed += interval;

      if (timeElapsed >= duration) {
        clearInterval(flash);
        const randomPoint = touchPointsRef.current[Math.floor(Math.random() * touchPointsRef.current.length)];
        setSelectedPoint(randomPoint);
        setTouchPoints([randomPoint]);
        setSelecting(false);
        setGameEnded(true);
      } else {
        // Durante a animação, piscar aleatoriamente entre os pontos
        setSelectedPoint(touchPointsRef.current[Math.floor(Math.random() * touchPointsRef.current.length)]);
      }
    }, interval);
  };

  const resetGame = () => {
    setTouchPoints([]);
    setSelectedPoint(null);
    setCountdown(null);
    setGameEnded(false);
    setSelecting(false);
    touchPointsRef.current = [];
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = null;
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
  }, [gameEnded]);

  return (
    <GameLayout title="Toque na Sorte">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center mb-4">
          <p className="text-white/80">
            Toque na tela com até 15 dedos e aguarde 3 segundos para o sorteio começar!
          </p>
        </div>

        <div
          ref={containerRef}
          className="w-full aspect-[3/4] bg-white/10 backdrop-blur-sm rounded-xl relative touch-none"
        >
          {/* Contador regressivo no topo */}
          <AnimatePresence>
            {countdown !== null && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-x-0 top-8 flex items-center justify-center"
              >
                <span className="text-8xl font-bold text-white drop-shadow-lg">
                  {countdown}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {touchPoints.map((point) => (
              <motion.div
                key={point.id}
                initial={{ scale: 0 }}
                animate={{
                  scale: selecting && selectedPoint?.id === point.id ? [1, 1.2, 1] : 1,
                  backgroundColor: selecting && selectedPoint?.id === point.id ?
                    [point.color, "#ffffff", point.color] : point.color
                }}
                exit={{ scale: 0 }}
                transition={{
                  duration: 0.3,
                  repeat: selecting && selectedPoint?.id === point.id ? Infinity : 0,
                  repeatDelay: 0.2
                }}
                style={{
                  position: "absolute",
                  left: point.x - 50,
                  top: point.y - 50,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  opacity: 0.8,
                  border: "3px solid rgba(255, 255, 255, 0.8)"
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {gameEnded && (
          <Button
            size="lg"
            onClick={resetGame}
            className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6 text-xl mt-8"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Jogar de novo
          </Button>
        )}
      </div>
    </GameLayout>
  );
}