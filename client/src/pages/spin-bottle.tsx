import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function SpinBottle() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const spinBottle = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const spins = 5 + Math.random() * 5; // Entre 5 e 10 voltas completas
    const newRotation = rotation + (spins * 360) + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
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
          <motion.div
            className="w-full h-full"
            animate={{ rotate: rotation }}
            transition={{
              type: "spring",
              duration: 3,
              bounce: 0.2
            }}
          >
            <img
              src="/garrafa.webp"
              alt="Garrafa"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>

        <Button
          size="lg"
          onClick={spinBottle}
          disabled={isSpinning}
          className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6 text-xl"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          {isSpinning ? "Girando..." : "Girar Garrafa"}
        </Button>
      </div>
    </GameLayout>
  );
}