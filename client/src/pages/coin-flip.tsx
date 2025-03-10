import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Coins, CircleDot, Crown } from "lucide-react";

export default function CoinFlip() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"cara" | "coroa" | null>(null);

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      setResult(Math.random() < 0.5 ? "cara" : "coroa");
      setIsFlipping(false);
    }, 1500); // Reduzido para 1.5 segundos
  };

  return (
    <GameLayout title="Cara ou Coroa">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center mb-4">
          <p className="text-white/80">
            Cara bebe, coroa passa!
          </p>
        </div>

        <div className="relative w-32 h-32"> {/* Reduzido o tamanho */}
          <motion.div
            className="w-full h-full"
            animate={isFlipping ? {
              rotateX: [0, 720 + (Math.random() < 0.5 ? 180 : 0)],
              y: [0, -150, 0], // Adicionado movimento vertical para simular o arremesso
              scale: [1, 1.1, 1]
            } : {}}
            transition={{
              duration: 1.5,
              times: [0, 0.5, 1], // Controla o timing da animação
              y: {
                type: "spring",
                stiffness: 200,
                damping: 15
              }
            }}
          >
            <div className="relative w-full h-full perspective-1000">
              <div className={`absolute w-full h-full rounded-full transition-transform duration-500 ${isFlipping ? "animate-flip" : ""}`}>
                {/* Cara */}
                <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center transform-style-3d backface-hidden border-4 border-yellow-300">
                  <CircleDot className="w-12 h-12 text-yellow-200" />
                </div>
                {/* Coroa */}
                <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center transform rotateY-180 transform-style-3d backface-hidden border-4 border-yellow-300">
                  <Crown className="w-12 h-12 text-yellow-200" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {result && !isFlipping && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-white"
          >
            {result.toUpperCase()}!
          </motion.div>
        )}

        <Button
          size="lg"
          onClick={flipCoin}
          disabled={isFlipping}
          className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-6 text-xl"
        >
          <Coins className="mr-2 h-5 w-5" />
          {isFlipping ? "Jogando..." : "Jogar Moeda"}
        </Button>
      </div>
    </GameLayout>
  );
}