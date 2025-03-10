import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useSound } from '@/hooks/use-sound';
import { cn } from "@/lib/utils";

interface RouletteProps {
  options: Array<{
    text: string;
    color: string;
  }>;
  onSpinEnd: (selectedOption: number) => void;
}

export function Roulette({ options, onSpinEnd }: RouletteProps) {
  const controls = useAnimation();
  const [isSpinning, setIsSpinning] = useState(false);
  const { play } = useSound();
  const wheelRef = useRef<HTMLDivElement>(null);
  const [showSparkles, setShowSparkles] = useState(false);

  const spin = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    play('spin');

    // Gerar um número aleatório de rotações (5-10) + ângulo final
    const rotations = Math.floor(Math.random() * 5) + 5;
    const finalAngle = Math.floor(Math.random() * 360);
    const totalDegrees = rotations * 360 + finalAngle;

    // Calcular o segmento selecionado
    const segmentSize = 360 / options.length;
    const selectedIndex = Math.floor((360 - (finalAngle % 360)) / segmentSize);

    await controls.start({
      rotate: totalDegrees,
      transition: {
        duration: 4,
        ease: [0.2, 0, 0.2, 1],
      },
    });

    setShowSparkles(true);
    play('result');
    setIsSpinning(false);
    onSpinEnd(selectedIndex);

    setTimeout(() => {
      setShowSparkles(false);
    }, 2000);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      {/* Sparkles animation */}
      <AnimatePresence>
        {showSparkles && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-yellow-400/20 to-purple-500/20 rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seta indicadora */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 w-0 h-0 border-x-[15px] border-x-transparent border-t-[30px] border-t-purple-700 z-20" />

      {/* Efeito de brilho em volta da roleta */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse" />

      {/* Roleta */}
      <motion.div
        ref={wheelRef}
        animate={controls}
        className="w-full h-full rounded-full overflow-hidden shadow-xl relative z-10 bg-gradient-to-br from-purple-500 to-pink-500"
        style={{ transformOrigin: "center center" }}
      >
        {options.map((option, index) => {
          const rotation = (index * 360) / options.length;
          return (
            <div
              key={index}
              className="absolute top-0 left-0 w-full h-full origin-center"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <div
                className="absolute top-0 left-0 w-1/2 h-full origin-right"
                style={{
                  transform: `rotate(${360 / options.length}deg)`,
                  backgroundColor: option.color,
                }}
              >
                <div
                  className={cn(
                    "absolute left-8 top-1/2 -translate-y-1/2 text-white font-bold text-base whitespace-nowrap transform rotate-[270deg] origin-left",
                    isSpinning && "blur-sm"
                  )}
                >
                  {option.text}
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Botão de girar */}
      <button
        onClick={spin}
        disabled={isSpinning}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-purple-700 text-white font-bold shadow-lg transform transition-transform ${
          isSpinning ? 'scale-90 opacity-50' : 'hover:scale-110'
        }`}
      >
        Girar
      </button>
    </div>
  );
}