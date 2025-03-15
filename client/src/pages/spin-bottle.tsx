import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { updateGameStats } from "@/lib/stats";

export default function SpinBottle() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameStartTime] = useState<number>(Date.now());

  const spinBottle = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const spins = 5 + Math.random() * 5; // Entre 5 e 10 voltas completas
    const newRotation = rotation + (spins * 360) + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);

      // Atualizar estatísticas quando a garrafa para
      const gameEndTime = Date.now();
      const playTimeInSeconds = Math.floor((gameEndTime - gameStartTime) / 1000);

      updateGameStats({
        gameType: "spinBottle",
        playTimeInSeconds,
        playerCount: 1
      });
    }, 3000);
  };

  return (
    <GameLayout title="Garrafa Giratória">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center mb-4">
          <p className="text-white/80">
            Gire a garrafa e veja quem será o escolhido!
          </p>
        </div>

        <div className="relative w-full max-w-md aspect-square">
          {/* Container estático com o círculo roxo */}
          <div className="absolute inset-0 rounded-full bg-purple-900/90" />

          {/* Container da seta que vai girar */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: rotation }}
            transition={{
              type: "spring",
              duration: 3,
              bounce: 0.2
            }}
          >
            <img
              src="/api/images/icone-fleche-droite-violet.png"
              alt="Seta"
              className="w-3/4 h-3/4 object-contain"
            />
          </motion.div>
        </div>

        <Button
          size="lg"
          onClick={spinBottle}
          disabled={isSpinning}
          className="bg-purple-900 hover:bg-purple-950 text-white hover:text-white px-8 py-6 text-xl"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          {isSpinning ? "Girando..." : "Girar Garrafa"}
        </Button>
      </div>
    </GameLayout>
  );
}