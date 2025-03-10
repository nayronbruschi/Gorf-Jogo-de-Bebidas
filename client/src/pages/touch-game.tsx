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
  const [countdown, setCountdown] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchPointsRef = useRef<TouchPoint[]>([]);
  const lastTouchTime = useRef<number>(0);

  const handleTouch = (e: TouchEvent) => {
    e.preventDefault();
    const now = Date.now();

    // Se não houver toques, resetar tudo
    if (e.touches.length === 0) {
      lastTouchTime.current = now;
      setTouchPoints([]);
      setSelectedPoint(null);
      setCountdown(null);
      touchPointsRef.current = [];
      return;
    }

    // Se estiver selecionando, ignorar novos toques
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
      setCountdown(null);
    }

    // Start new timer if there are points
    if (newPoints.length > 0) {
      lastTouchTime.current = now;
      // Iniciar contagem regressiva
      setCountdown(3);

      // Atualizar contagem a cada segundo
      const updateCountdown = () => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            selectRandom();
            return null;
          }
          return prev - 1;
        });
      };

      // Criar intervalos para a contagem regressiva
      const countdown1 = setTimeout(updateCountdown, 1000);
      const countdown2 = setTimeout(updateCountdown, 2000);
      const countdown3 = setTimeout(() => {
        updateCountdown();
      }, 3000);

      timerRef.current = countdown3;
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

        // Auto-limpar após 2 segundos
        setTimeout(() => {
          if (Date.now() - lastTouchTime.current > 1500) {
            setTouchPoints([]);
            setSelectedPoint(null);
            touchPointsRef.current = [];
          }
        }, 2000);
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
          {/* Contador regressivo */}
          <AnimatePresence>
            {countdown !== null && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="text-8xl font-bold text-white/90">
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
                  left: point.x - 50, // Aumentado para mais tolerância
                  top: point.y - 50, // Aumentado para mais tolerância
                  width: 100, // Aumentado o tamanho
                  height: 100, // Aumentado o tamanho
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