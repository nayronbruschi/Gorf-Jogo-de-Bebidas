import { useState, useEffect, useRef } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronLeft, Hand } from "lucide-react";
import { useLocation } from "wouter";
import { auth, updateGameStats, startGameSession, endGameSession } from "@/lib/firebase";

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  color: string;
}

// Array de cores vibrantes para os círculos
const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"
];

export default function TouchGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<TouchPoint | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchPointsRef = useRef<TouchPoint[]>([]);
  const [, setLocation] = useLocation();
  let timer: NodeJS.Timer | undefined;


  // Registrar o jogo assim que entrar na página
  useEffect(() => {
    const trackGameOpen = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          await updateGameStats(userId, "Toque na Sorte");
          // Iniciar sessão do jogo
          await startGameSession(userId, "Toque na Sorte");
        }
      } catch (error) {
        console.error("[TouchGame] Error tracking game:", error);
      }
    };

    trackGameOpen();

    // Cleanup function to end the game session
    return () => {
      const endSession = async () => {
        try {
          const userId = auth.currentUser?.uid;
          if (userId) {
            await endGameSession(userId);
          }
        } catch (error) {
          console.error("[TouchGame] Error ending game session:", error);
        }
      };
      endSession();
    };
  }, []);

  const handleBack = () => {
    if (timer) clearInterval(timer);
    setLocation("/game-modes");
  };

  const handleTouch = (e: TouchEvent) => {
    e.preventDefault();

    if (gameEnded) return;

    if (e.touches.length === 0) {
      setTouchPoints([]);
      touchPointsRef.current = [];
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newPoints: TouchPoint[] = [];
    for (let i = 0; i < e.touches.length && i < 5; i++) {
      const touch = e.touches[i];
      newPoints.push({
        id: i,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        color: colors[i]
      });
    }

    if (countdown === null) {
      setTouchPoints(newPoints);
      touchPointsRef.current = newPoints;

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
    const duration = 2000;
    const interval = 150;
    let timeElapsed = 0;

    timer = setInterval(() => {
      timeElapsed += interval;

      if (timeElapsed >= duration) {
        clearInterval(timer);
        const randomPoint = touchPointsRef.current[Math.floor(Math.random() * touchPointsRef.current.length)];

        setSelecting(false);

        setTimeout(() => {
          touchPointsRef.current = [randomPoint];
          setSelectedPoint(randomPoint);
          setTouchPoints([randomPoint]);
          setGameEnded(true);
        }, 100);
      } else {
        setTouchPoints([...touchPointsRef.current]);
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
    if (timer) clearInterval(timer);
  };

  useEffect(() => {
    if (!isPlaying) return;

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
  }, [isPlaying, gameEnded]);

  if (!isPlaying) {
    return (
      <GameLayout title="Toque na Sorte">
        <div className="flex flex-col items-center gap-8 p-6">
          <div className="text-center space-y-4">
            <Hand className="w-16 h-16 text-purple-900 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-purple-900 mb-2">Como Jogar</h2>
            <p className="text-purple-900 text-lg leading-relaxed">
              1. Toque na tela com vários dedos ao mesmo tempo (até 5)
            </p>
            <p className="text-purple-900 text-lg leading-relaxed">
              2. Mantenha os dedos na tela por 3 segundos
            </p>
            <p className="text-purple-900 text-lg leading-relaxed">
              3. O jogo vai sortear aleatoriamente um dos dedos
            </p>
            <p className="text-purple-900 text-lg leading-relaxed">
              4. O dedo escolhido é o vencedor!
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setIsPlaying(true)}
            className="bg-gorf-green hover:bg-green-700 text-white px-8 py-6 text-xl mt-8"
          >
            Começar
          </Button>
        </div>
      </GameLayout>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-purple-900 to-purple-800 relative">
      <div className="absolute top-0 left-0 right-0 px-4 py-4 flex items-center z-50">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/20"
          onClick={handleBack}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="flex-1 flex justify-center">
          {gameEnded ? (
            <Button
              onClick={resetGame}
              className="bg-gorf-green hover:bg-green-700 text-white"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Jogar de novo
            </Button>
          ) : (
            <div className="text-white/80 text-sm">
              Coloque os dedos na tela para sortear
            </div>
          )}
        </div>

        <div className="w-10" />
      </div>

      <div className="flex flex-col items-center h-full">
        <div
          ref={containerRef}
          className="w-full h-full relative touch-none"
        >
          <AnimatePresence>
            {countdown !== null && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-x-0 top-1/4 flex items-center justify-center"
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
                  scale: selecting ? [1, 1.2, 1] : 1
                }}
                exit={{ scale: 0 }}
                transition={{
                  scale: {
                    duration: 0.3,
                    repeat: selecting ? Infinity : 0,
                    repeatDelay: 0.2
                  }
                }}
                style={{
                  position: "absolute",
                  left: point.x - 50,
                  top: point.y - 50,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  backgroundColor: point.color,
                  opacity: gameEnded ? 1 : 0.8,
                  border: "3px solid rgba(255, 255, 255, 0.8)"
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}