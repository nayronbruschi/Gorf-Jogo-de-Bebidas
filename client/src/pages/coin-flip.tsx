import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

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
    }, 3000);
  };

  return (
    <GameLayout title="Cara ou Coroa">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center mb-4">
          <p className="text-white/80">
            Cara bebe, coroa passa!
          </p>
        </div>

        <div className="relative w-64 h-64">
          <motion.div
            className="w-full h-full"
            animate={isFlipping ? {
              rotateX: [0, 720 + (Math.random() < 0.5 ? 180 : 0)],
              scale: [1, 1.2, 1]
            } : {}}
            transition={{
              duration: 3,
              ease: "easeOut"
            }}
          >
            <div className="relative w-full h-full perspective-1000">
              <div className={`absolute w-full h-full rounded-full transition-transform duration-500 ${isFlipping ? "animate-flip" : ""}`}>
                {/* Cara */}
                <div className="absolute w-full h-full rounded-full bg-purple-600 flex items-center justify-center transform-style-3d backface-hidden">
                  <span className="text-4xl font-bold text-white">C</span>
                </div>
                {/* Coroa */}
                <div className="absolute w-full h-full rounded-full bg-pink-600 flex items-center justify-center transform rotateY-180 transform-style-3d backface-hidden">
                  <span className="text-4xl font-bold text-white">♛</span>
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
